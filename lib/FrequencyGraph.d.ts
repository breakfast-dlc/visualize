import { AudioVisualizer } from "./AudioVisualizer";
import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import { FrequencyGraphFillType } from "./types";
declare type FrequencyGraphType = "simple-bar-graph" | "block-bar-graph" | "frequency-curve";
export interface FrequencyGraphConfig extends AudioVisualizerConfigInterface {
    numBars?: number;
    type?: FrequencyGraphType;
    fillType?: FrequencyGraphFillType;
}
export declare class FrequencyGraph extends AudioVisualizer {
    static SIMPLE_BAR_GRAPH: FrequencyGraphType;
    static BLOCK_BAR_GRAPH: FrequencyGraphType;
    static FREQUENCY_CURVE: FrequencyGraphType;
    numBars: number;
    private _type;
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: FrequencyGraphConfig);
    protected _getFrequencyAverages(): Array<number>;
    drawBarGraph(): void;
    drawBarGraphBlocks: () => void;
    get type(): FrequencyGraphType;
    set type(value: FrequencyGraphType);
}
export {};
