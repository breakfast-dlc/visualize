import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
interface FrequencyCurveConfig extends FrequencyGraphConfig {
    lineWidth?: number;
}
export declare class FrequencyCurve extends FrequencyGraph {
    lineWidth: number;
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: FrequencyCurveConfig);
    draw(): void;
}
export {};
