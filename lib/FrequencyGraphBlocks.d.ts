import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
interface FrequencyGraphBlocksConfig extends FrequencyGraphConfig {
    numRows?: number;
}
export declare class FrequencyGraphBlocks extends FrequencyGraph {
    numRows?: number;
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: FrequencyGraphBlocksConfig);
    draw(): void;
}
export {};
