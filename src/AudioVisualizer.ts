/**
 * Valid fft size values for an AnalyserNode
 */
export type FftSize =
    | 16
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 32768;

/**
 * The value that the AudioVisualizer's color or backgroundColor can be set to
 */
export type AudioVisualizerFillColor = string | string[];

/**
 * A callback that can be used to modify the canvas / context while rendering the visual
 */
export type AudioVisualizerCallback = (
    context: CanvasRenderingContext2D | WebGL2RenderingContext,
    canvas?: HTMLCanvasElement,
    data?: any
) => void;

/**
 * An index of all callbacks that have been passed to the visualizer
 */
export interface AudioVisualizerCallbackIndex {
    [key: string]: {
        [key: string]: AudioVisualizerCallback;
    };
}

/**
 * Defines a configuration that can be passed to an AudioVisualizer when it is first created
 */
export interface AudioVisualizerConfig {
    /**
     * (Optional) The frames per second that the visualition should run at. A high fps will result in a smoother
     * animation, but uses more resources. By default, the AudioVisualizer will use the highest possible fps, which
     * is typically around 60 fps
     */
    fps?: number;

    /**
     * (Optional) The aspect ratio to use when sizing the canvas. Defaults to a wide screen ratio (16:9)
     */
    aspectRatio?: {
        width: number;
        height: number;
    };

    /**
     * (Optional) The background color to use for the visualization. Can be a string or an array. If an array is passed,
     * the background will be set to a gradient with the first color at the top of the canvas and last color at the bottom.
     * Defaults to the background color of the canvas element
     */
    backgroundColor?: AudioVisualizerFillColor;

    /**
     * (Optional) The foreground color to use for the visualization. Can be a string or an array. If an array is passed,
     * the color will be a gradient with the first color at the top of the canvas and last color at the bottom.
     * Defaults to the color of the canvas element
     */
    color?: AudioVisualizerFillColor;
}

const DPI: number = window.devicePixelRatio;

const DEFAULT_ASPECT_RATIO = {
    height: 9,
    width: 16,
};

const MAX_FRAMES_PER_SECOND: number = 60;

const MILLISECONDS_PER_SECOND: number = 1000;

const MIN_THROTTLE_TIME: number =
    MILLISECONDS_PER_SECOND / MAX_FRAMES_PER_SECOND;

const DEFAULT_FFT_SIZE: FftSize = 2048;

const DEFAULT_BACKGROUND_COLOR = "white";

/**
 * Base AudioVisualizer class
 */
export abstract class AudioVisualizer {
    /**
     * The analyser node from which the visualizer will get data about the audio
     */
    analyser: AnalyserNode;

    /**
     * The canvas element the visualizer will use to display the visual
     */
    canvas: HTMLCanvasElement;

    /**
     * Aspect ratio for the visualizer
     */
    aspectRatio: {
        height: number;
        width: number;
    };

    /**
     * The background color to use for the visual. Can be set to an array,
     * in which case the background color will be set to an array
     */
    backgroundColor?: AudioVisualizerFillColor;

    /**
     * The foreground color to use for the visual. Can be set to an array
     */
    color?: AudioVisualizerFillColor;

    /**
     * Whether or not the animation is currently active
     */
    protected _animationIsActive: boolean;

    /**
     * The fft size to use for the visualizer
     */
    protected _fftSize: FftSize;

    /**
     * The throttle time to use when controlling fps
     */
    protected _throttleTime?: number;

    /**
     * A cache for the calculated canvas style
     */
    protected _canvasStyleCache?: CSSStyleDeclaration;

    /**
     * An object containing callbacks organized by event type
     */
    protected _callbacks: AudioVisualizerCallbackIndex;

    /**
     *
     * @param analyser An AnalyserNode that is connected to the audio source that will be visualized
     * @param canvas A canvas element that the visualization will be rendered in
     * @param config (Optional) An object that describes how the AudioVisualizer should be configured
     */
    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: AudioVisualizerConfig = {}
    ) {
        if (config.aspectRatio) {
            this.aspectRatio = config.aspectRatio;
        } else {
            this.aspectRatio = DEFAULT_ASPECT_RATIO;
        }

        this.backgroundColor = config.backgroundColor;
        this.color = config.color;

        if (config.fps) {
            this.fps = config.fps;
        }

        this._fftSize = DEFAULT_FFT_SIZE;

        //Initalize animation state
        this._animationIsActive = true;

        if (!analyser) {
            console.error("Error: analyser is null or undefined");
        }

        this.analyser = analyser;

        if (!canvas) {
            console.error("Error: canvas is null or undefined");
        }

        this.canvas = canvas;
        this._callbacks = {
            onSetUpForeground: {},
        };

        //Resize
        this.reset();
    }

    /**
     * Resizes the canvas element according to the width of the parent element and the specified aspect ratio
     */
    resize() {
        const parent = this.canvas.parentElement;

        if (!parent) {
            return;
        }

        const maxHeight = parent.clientHeight;
        const maxWidth = parent.clientWidth;

        let heightToWidthRatio =
            this.aspectRatio.width / this.aspectRatio.height;
        let widthToHeightRatio =
            this.aspectRatio.height / this.aspectRatio.width;

        //Check width
        let newWidth;
        let newHeight;
        if (maxWidth * widthToHeightRatio > maxHeight) {
            //Fit to height
            newWidth = maxHeight * heightToWidthRatio * DPI;
            newHeight = maxHeight * DPI;
        } else {
            //Fit to width
            newWidth = maxWidth * DPI;
            newHeight = maxWidth * widthToHeightRatio * DPI;
        }

        //Update Canvas
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
    }

    /**
     * Starts the animation loop for the visualizer
     */
    start = () => {
        if (!this._animationIsActive) {
            return;
        }

        this._draw();
        this._clearCanvasStyle();

        if (this._throttleTime && this._throttleTime >= MIN_THROTTLE_TIME) {
            setTimeout(() => {
                requestAnimationFrame(this.start);
            }, this._throttleTime);
        } else {
            requestAnimationFrame(this.start);
        }
    };

    /**
     * Stops the animation loop
     */
    stop() {
        this._animationIsActive = false;
    }

    /**
     * Stops and then starts the animation loop. Also triggers a resize
     */
    reset() {
        this.stop();
        setTimeout(() => {
            this._animationIsActive = true;
            requestAnimationFrame(this.start);
            this.resize();
        }, (this._throttleTime ?? MIN_THROTTLE_TIME) * 2);
    }

    /**
     * Adds a callback for a specific event
     * @param eventName The tag of the event to attach the callback to
     * @param callback The callback to be called on the event
     */
    on(eventName: string, callback: AudioVisualizerCallback) {
        if (!eventName) {
            console.warn("Failed to add callback: event name is undefined");
            return;
        }

        if (typeof callback !== "function") {
            console.warn(
                "Failed to add callback: Invalid callback. Callback must be a function."
            );
            return;
        }

        if (typeof this._callbacks[eventName] === "undefined") {
            console.warn(
                `Failed to add callback: Invalid tag. This visualizer does not support the event ${eventName}`
            );
            return;
        }

        //Determine index
        let index: string | number = callback.name;
        if (index === "" || index === "anonymous") {
            index = Object.keys(this._callbacks[eventName]).length;
        }

        this._callbacks[eventName][index] = callback;
    }

    /**
     * Renders the visualization on each animation frame.
     */
    protected abstract _draw(): void;

    /**
     * Returns the canvas's 2d context
     */
    protected _get2DContext(): CanvasRenderingContext2D {
        return this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    /**
     * Returns and caches the css style declaration for the canvas element
     */
    protected _getCanvasStyle(): CSSStyleDeclaration {
        if (!this._canvasStyleCache) {
            this._canvasStyleCache = window.getComputedStyle(this.canvas);
        }

        return this._canvasStyleCache;
    }

    /**
     * Clears the saved canvas style cache
     */
    private _clearCanvasStyle = () => {
        this._canvasStyleCache = undefined;
    };

    /**
     * Returns a new canvas gradient
     * @param context The canvas's 2d rendering context
     * @param colorArray Array of colors in the order they will appear in the gradient
     * @param coordinates Array of x and y coordinates that are used to determine the size and position of the gradient
     * @returns The canvas gradient
     */
    protected _createGradient(
        context: CanvasRenderingContext2D,
        colorArray: string[],
        coordinates: [number, number, number, number]
    ): CanvasGradient {
        const [x1, y1, x2, y2] = coordinates;

        //Create gradient
        let gradient = context.createLinearGradient(x1, y1, x2, y2);

        let colors = [...colorArray];

        let firstColor = colors.shift() as string;
        let lastColor = colors.pop() as string;

        gradient.addColorStop(0, firstColor);

        //If more than 2 colors, divide space equally between all colors
        if (colors.length > 0) {
            let offsetIncrement = 1 / (colors.length + 1);
            let offset = offsetIncrement;

            for (let color of colors) {
                gradient.addColorStop(offset, color);
                offset += offsetIncrement;
            }
        }

        gradient.addColorStop(1, lastColor);

        return gradient;
    }

    /**
     * Returns fills
     * @param color
     * @param coordinates
     * @returns
     */
    protected _getFillStyleFromColor(
        color: AudioVisualizerFillColor,
        coordinates: [number, number, number, number]
    ): CanvasGradient | string | null {
        if (Array.isArray(color) && color.length > 1) {
            if (color.length > 1) {
                let context = this._get2DContext();
                if (!context) {
                    return null;
                }
                return this._createGradient(context, color, coordinates);
            } else {
                return color[0];
            }
        } else {
            return color as string;
        }
    }

    /**
     * Fills in the visualizer background
     * @param context The canvas's 2d rendering context
     */
    protected _setBackgroundFillStyle(context: CanvasRenderingContext2D) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        //If backgroundColor / color not specified, get styles from parent element
        let backgroundColor: AudioVisualizerFillColor;
        if (this.backgroundColor) {
            backgroundColor = this.backgroundColor;
        } else {
            let canvasStyle = this._getCanvasStyle();
            backgroundColor = canvasStyle
                ? canvasStyle.getPropertyValue("background-color")
                : DEFAULT_BACKGROUND_COLOR;
        }

        let midpoint = width / 2;

        let fillStyle =
            this._getFillStyleFromColor(backgroundColor, [
                midpoint,
                0,
                midpoint,
                height,
            ]) ?? DEFAULT_BACKGROUND_COLOR;

        context.fillStyle = fillStyle;

        context.fillRect(0, 0, width, height);
    }

    /**
     * Passes the given context to all the callbacks for the onSetUpForeground event
     * @param context The canvas context that will be passed to the callbacks
     */
    protected _applyForegroundFilters(
        context: CanvasRenderingContext2D
    ): CanvasRenderingContext2D {
        const callbacks = Object.values(this._callbacks.onSetUpForeground);

        for (let callback of callbacks) {
            callback(context);
        }

        return context;
    }

    /**
     * Sets the frames per second for the
     */
    set fps(fps: number) {
        if (!fps) {
            return;
        }

        if (fps > MAX_FRAMES_PER_SECOND) {
            fps = MAX_FRAMES_PER_SECOND;
        }

        this._throttleTime = MILLISECONDS_PER_SECOND / fps;
    }

    /**
     * Returns the visualizer fft size
     */
    get fftSize(): FftSize {
        return this._fftSize;
    }
}
