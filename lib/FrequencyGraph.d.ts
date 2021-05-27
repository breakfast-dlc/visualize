import { AudioVisualizer } from "./AudioVisualizer";
import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
declare type FrequencyGraphType = "simple-bar-graph" | "block-bar-graph" | "frequency-curve";
export interface FrequencyGraphConfig extends AudioVisualizerConfigInterface {
    numColumns?: number;
}
export declare class FrequencyGraph extends AudioVisualizer {
    static SIMPLE_BAR_GRAPH: FrequencyGraphType;
    static BLOCK_BAR_GRAPH: FrequencyGraphType;
    static FREQUENCY_CURVE: FrequencyGraphType;
    static _DEFAULT_NUM_BARS: number;
    numColumns: number;
    constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement, config?: FrequencyGraphConfig);
    protected _getFrequencyAverages(): Array<number>;
    draw(): void;
    /**
     *
     * @param x The x position to start drawing the bar
     * @param y The y position to start drawing the bar. Will be equal to height of the bar
     * @param barWidth The width of the bar
     * @returns
     */
    protected _fillFrequencyBar(x: number, y: number, barWidth: number): null | undefined;
}
export {};
