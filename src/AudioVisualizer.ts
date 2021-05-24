import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import {
    FftSize,
    BeforeDrawCallback,
    AudioVisualizerFillColor,
    ModifyBackgroundCallback,
} from "./types";

const DPI: number = window.devicePixelRatio;
const DEFAULT_WIDTH_TO_HEIGHT_RATIO: number = 9 / 16; //Wide screen ratio
const DEFAULT_HEIGHT_TO_WIDTH_RATIO: number = 16 / 9; //Wide screen ratio
const MAX_FRAMES_PER_SECOND: number = 60;
const MILLISECONDS_PER_SECOND: number = 1000;
const DEFAULT_THROTTLE_TIME: number =
    MILLISECONDS_PER_SECOND / MAX_FRAMES_PER_SECOND;

const DEFAULT_FFT_SIZE: FftSize = 2048;

//Canvas Constants
const DEFAULT_BACKGROUND_COLOR = "white";

//TODO: Look at auto resizing on the scroll event for when parent div changes width

export class AudioVisualizer {
    analyser: AnalyserNode;
    canvas: HTMLCanvasElement;
    heightToWidthRatio: number;
    widthToHeightRatio: number;
    width?: number;
    height?: number;
    backgroundColor?: AudioVisualizerFillColor;
    color?: AudioVisualizerFillColor;
    animationIsActive: boolean;
    _fftSize: FftSize;
    _throttleTime: number;
    _canvasStyle?: CSSStyleDeclaration;
    _beforeDraw: BeforeDrawCallback;
    _modifyBackground: ModifyBackgroundCallback;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: AudioVisualizerConfigInterface = {}
    ) {
        if (config.aspectRatio) {
            this.widthToHeightRatio =
                config.aspectRatio.height / config.aspectRatio.width;
            this.heightToWidthRatio =
                config.aspectRatio.width / config.aspectRatio.height;
        } else {
            this.widthToHeightRatio = DEFAULT_WIDTH_TO_HEIGHT_RATIO;
            this.heightToWidthRatio = DEFAULT_HEIGHT_TO_WIDTH_RATIO;
        }

        this.backgroundColor = config.backgroundColor;
        this.color = config.color;

        this._throttleTime = DEFAULT_THROTTLE_TIME;

        if (config.fps) {
            this.fps = config.fps;
        }

        this._fftSize = config.fftSize ?? DEFAULT_FFT_SIZE;

        //Initialize callbacks
        const doNothing = (
            context: CanvasRenderingContext2D | WebGL2RenderingContext
        ) => {
            /*Do Nothing*/
        };
        this._beforeDraw = config.beforeDraw ?? doNothing;

        this._modifyBackground = config.modifyBackground ?? doNothing;

        //Initalize animation state
        this.animationIsActive = true;

        if (!analyser) {
            console.error("Error: analyser is null or undefined");
        }

        this.analyser = analyser;

        if (!canvas) {
            console.error("Error: canvas is null or undefined");
        }

        this.canvas = canvas;

        //Resize
        this.reset();
    }

    resize() {
        const parent = this.canvas.parentElement;

        if (!parent) {
            return;
        }

        const maxHeight = parent.clientHeight;
        const maxWidth = parent.clientWidth;

        //Check width
        let newWidth;
        let newHeight;
        if (maxWidth * this.widthToHeightRatio > maxHeight) {
            //Fit to height
            newWidth = maxHeight * this.heightToWidthRatio * DPI;
            newHeight = maxHeight * DPI;
        } else {
            //Fit to width
            newWidth = maxWidth * DPI;
            newHeight = maxWidth * this.widthToHeightRatio * DPI;
        }

        //Update Canvas
        this.width = newWidth;
        this.height = newHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    start = () => {
        if (!this.animationIsActive) {
            return;
        }

        this.draw();
        this._clearCanvasStyle();

        setTimeout(() => {
            requestAnimationFrame(this.start);
        }, this._throttleTime);
    };

    draw() {
        console.error("Draw function has not been implemented");
    }

    stop() {
        this.animationIsActive = false;
    }

    reset() {
        this.stop();
        setTimeout(() => {
            this.animationIsActive = true;
            requestAnimationFrame(this.start);
            this.resize();
        }, this._throttleTime * 2);
    }

    protected _get2DContext(): CanvasRenderingContext2D {
        return this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    protected _getCanvasStyle = () => {
        if (!this._canvasStyle) {
            this._canvasStyle = window.getComputedStyle(this.canvas);
        }

        return this._canvasStyle;
    };

    /**
     * Clears the saved canvas style
     */
    private _clearCanvasStyle = () => {
        this._canvasStyle = undefined;
    };

    protected _createGradient(
        context: CanvasRenderingContext2D,
        colorArray: string[],
        width: number,
        height: number
    ): CanvasGradient {
        //Create gradient
        let midpoint = width / 2;
        let gradient = context.createLinearGradient(
            midpoint,
            0,
            midpoint,
            height
        );

        let colors = [...colorArray];

        let firstColor = colors.shift() as string;
        let lastColor = colors.pop() as string;

        gradient.addColorStop(0, firstColor);

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

    protected _getFillStyleFromColor(
        color: AudioVisualizerFillColor,
        width: number,
        height: number
    ): CanvasGradient | string | null {
        if (Array.isArray(color) && color.length > 1) {
            if (color.length > 1) {
                let context = this._get2DContext();
                if (!context) {
                    return null;
                }
                return this._createGradient(context, color, width, height);
            } else {
                return color[0];
            }
        } else {
            return color as string;
        }
    }

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

        if (Array.isArray(backgroundColor)) {
            //Create gradient
            let gradient = this._createGradient(
                context,
                backgroundColor,
                width,
                height
            );
            context.fillStyle = gradient;
        } else {
            //Solid background
            context.fillStyle = backgroundColor;
        }

        //User callback for modifying background
        this.modifyBackground(context, this.canvas);

        context.fillRect(0, 0, width, height);
    }

    //Getters and Setters

    set fps(fps: number) {
        if (!fps) {
            return;
        }

        if (fps > MAX_FRAMES_PER_SECOND) {
            fps = MAX_FRAMES_PER_SECOND;
        }

        this._throttleTime = MILLISECONDS_PER_SECOND / fps;
    }

    get fftSize(): FftSize {
        return this._fftSize;
    }

    set fftSize(size: FftSize) {
        if (!size) {
            return;
        }

        this._fftSize = size;
    }

    get beforeDraw(): BeforeDrawCallback {
        return this._beforeDraw;
    }

    set beforeDraw(beforeDraw: BeforeDrawCallback) {
        if (beforeDraw) {
            this._beforeDraw = beforeDraw;
        }
    }

    get modifyBackground(): ModifyBackgroundCallback {
        return this._modifyBackground;
    }

    set modifyBackground(callback: ModifyBackgroundCallback) {
        if (callback) {
            this._modifyBackground = callback;
        }
    }
}
