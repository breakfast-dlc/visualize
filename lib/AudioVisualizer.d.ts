import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import { FftSize, BeforeDrawCallback, AudioVisualizerFillColor, ModifyBackgroundCallback } from "./types";
export declare class AudioVisualizer {
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
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: AudioVisualizerConfigInterface);
    resize(): void;
    start: () => void;
    draw(): void;
    stop(): void;
    reset(): void;
    protected _get2DContext(): CanvasRenderingContext2D;
    protected _getCanvasStyle: () => CSSStyleDeclaration;
    /**
     * Clears the saved canvas style
     */
    private _clearCanvasStyle;
    protected _createGradient(context: CanvasRenderingContext2D, colorArray: string[], width: number, height: number): CanvasGradient;
    protected _getFillStyleFromColor(color: AudioVisualizerFillColor, width: number, height: number): CanvasGradient | string | null;
    protected _setBackgroundFillStyle(context: CanvasRenderingContext2D): void;
    set fps(fps: number);
    get fftSize(): FftSize;
    set fftSize(size: FftSize);
    get beforeDraw(): BeforeDrawCallback;
    set beforeDraw(beforeDraw: BeforeDrawCallback);
    get modifyBackground(): ModifyBackgroundCallback;
    set modifyBackground(callback: ModifyBackgroundCallback);
}
