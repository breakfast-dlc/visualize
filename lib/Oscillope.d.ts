import { AudioVisualizer } from "./AudioVisualizer";
import { OscillopeConfigInterface } from "./OscillopeConfigInterface";
export declare class Oscillope extends AudioVisualizer {
    strokeWidth: number;
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: OscillopeConfigInterface);
    draw(): void;
}
