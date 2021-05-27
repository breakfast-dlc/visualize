import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import { FftSize, BeforeDrawCallback, AudioVisualizerFillColor, ModifyBackgroundCallback } from "./types";
export declare abstract class AudioVisualizer {
    analyser: AnalyserNode;
    canvas: HTMLCanvasElement;
    heightToWidthRatio: number;
    widthToHeightRatio: number;
    width?: number;
    height?: number;
    backgroundColor?: AudioVisualizerFillColor;
    color?: AudioVisualizerFillColor;
    animationIsActive: boolean;
    protected _fftSize: FftSize;
    protected _throttleTime: number;
    protected _canvasStyle?: CSSStyleDeclaration;
    protected _beforeDraw: BeforeDrawCallback;
    protected _modifyBackground: ModifyBackgroundCallback;
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: AudioVisualizerConfigInterface);
    /**
     * Resizes the canvas element according to the width of the parent element and the specified aspect ratio
     */
    resize(): void;
    /**
     * Starts the animation loop for the visualizer
     */
    start: () => void;
    /**
     * Renders the visualization on each animation frame. Should be overriden by child classes
     */
    abstract draw(): void;
    /**
     * Stops the animation loop
     */
    stop(): void;
    /**
     * Stops and then starts the animation loop. Also triggers a resize
     */
    reset(): void;
    /**
     * Returns the canvas's 2d context
     */
    protected _get2DContext(): CanvasRenderingContext2D;
    /**
     * Returns and caches the css style declaration for the canvas element
     */
    protected _getCanvasStyle(): CSSStyleDeclaration;
    /**
     * Clears the saved canvas style cache
     */
    private _clearCanvasStyle;
    /**
     * Returns a new canvas gradient
     * @param context The canvas's 2d rendering context
     * @param colorArray Array of colors in the order they will appear in the gradient
     * @param coordinates Array of x and y coordinates that are used to determine the size and position of the gradient
     * @returns The canvas gradient
     */
    protected _createGradient(context: CanvasRenderingContext2D, colorArray: string[], coordinates: [number, number, number, number]): CanvasGradient;
    /**
     * Returns fills
     * @param color
     * @param coordinates
     * @returns
     */
    protected _getFillStyleFromColor(color: AudioVisualizerFillColor, coordinates: [number, number, number, number]): CanvasGradient | string | null;
    /**
     * Fills in the visualizer background
     * @param context The canvas's 2d rendering context
     */
    protected _setBackgroundFillStyle(context: CanvasRenderingContext2D): void;
    set fps(fps: number);
    get fftSize(): FftSize;
    get beforeDraw(): BeforeDrawCallback;
    set beforeDraw(beforeDraw: BeforeDrawCallback);
    get modifyBackground(): ModifyBackgroundCallback;
    set modifyBackground(callback: ModifyBackgroundCallback);
}
