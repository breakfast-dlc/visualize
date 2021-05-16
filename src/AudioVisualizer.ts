import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import { FftSize, BeforeDrawCallback } from "./types";

const DPI: number = window.devicePixelRatio;
const DEFAULT_WIDTH_TO_HEIGHT_RATIO: number = 9 / 16; //Wide screen ratio
const DEFAULT_HEIGHT_TO_WIDTH_RATIO: number = 16 / 9; //Wide screen ratio
const DEFAULT_FRAMES_PER_SECOND: number = 60;
const MILLISECONDS_PER_SECOND: number = 1000;
const DEFAULT_THROTTLE_TIME: number =
    MILLISECONDS_PER_SECOND / DEFAULT_FRAMES_PER_SECOND;

const DEFAULT_FFT_SIZE: FftSize = 2048;

//TODO: Look at auto resizing on the scroll event for when parent div changes width

export class AudioVisualizer {
    analyser: AnalyserNode;
    canvas: HTMLCanvasElement;
    heightToWidthRatio: number;
    widthToHeightRatio: number;
    width?: number;
    height?: number;
    animationIsActive: boolean;
    _fftSize: FftSize;
    _throttleTime: number;
    _beforeDraw: BeforeDrawCallback;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: AudioVisualizerConfigInterface = {}
    ) {
        if (!analyser) {
            console.error(
                "Failed to initialize Audio Visualizer: missing analyser"
            );
        }

        if (!canvas) {
            console.error(
                "Failed to initialize Audio Visualizer: missing canvas"
            );
        }
        this.analyser = analyser;
        this.canvas = canvas;

        if (config.aspectRatio) {
            this.widthToHeightRatio =
                config.aspectRatio.height / config.aspectRatio.width;
            this.heightToWidthRatio =
                config.aspectRatio.width / config.aspectRatio.height;
        } else {
            this.widthToHeightRatio = DEFAULT_WIDTH_TO_HEIGHT_RATIO;
            this.heightToWidthRatio = DEFAULT_HEIGHT_TO_WIDTH_RATIO;
        }

        this._throttleTime = DEFAULT_THROTTLE_TIME;

        if (config.fps) {
            this.fps = config.fps;
        }

        this._fftSize = config.fftSize ?? DEFAULT_FFT_SIZE;

        this._beforeDraw =
            config.beforeDraw ??
            ((canvas) => {
                /*Do Nothing*/
            });

        this.animationIsActive = true;

        console.log(this.canvas);

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

        setTimeout(() => {
            requestAnimationFrame(this.start);
        }, this._throttleTime);
    };

    draw() {
        this._setUpDraw();
        this.beforeDraw(this.canvas);
        this._completeDraw();
    }

    protected _setUpDraw() {
        console.error("Set Up Draw function has not been implemented");
    }

    protected _completeDraw() {
        console.error("Complete Draw function has not been implemented");
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

    //Getters and Setters

    set fps(fps: number) {
        if (!fps) {
            return;
        }

        this._throttleTime = MILLISECONDS_PER_SECOND / fps;
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
}
