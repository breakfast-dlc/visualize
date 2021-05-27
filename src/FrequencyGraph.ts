import { AudioVisualizer } from "./AudioVisualizer";
import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import {
    average,
    CANVAS_PADDING_TOP,
    frequencyDataToDecibel,
    getSteps,
    MAX_FREQUENCY,
    MAX_FREQUENCY_DATA_VALUE,
    stepsToFrequency,
} from "./helpers";
import { AudioVisualizerFillColor } from "./types";

const DEFAULT_SIZE = 32;
const DEFAULT_COLOR = "black";

type FrequencyGraphType =
    | "simple-bar-graph"
    | "block-bar-graph"
    | "frequency-curve";

export interface FrequencyGraphConfig extends AudioVisualizerConfigInterface {
    numColumns?: number;
}

export class FrequencyGraph extends AudioVisualizer {
    static SIMPLE_BAR_GRAPH: FrequencyGraphType = "simple-bar-graph";
    static BLOCK_BAR_GRAPH: FrequencyGraphType = "block-bar-graph";
    static FREQUENCY_CURVE: FrequencyGraphType = "frequency-curve";
    static _DEFAULT_NUM_BARS = DEFAULT_SIZE;

    numColumns: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: FrequencyGraphConfig = {}
    ) {
        super(analyser, canvas, config);

        this.numColumns = config.numColumns ?? DEFAULT_SIZE;
        this._fftSize = 16384;
    }

    protected _getFrequencyAverages(): Array<number> {
        const frequencyAverages = [];
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const totalSteps = getSteps(MAX_FREQUENCY);
        const numBars = this.numColumns ?? DEFAULT_SIZE;
        const barIncrement = totalSteps / numBars;
        const frequencyChunkSize = MAX_FREQUENCY / bufferLength;

        let lastTargetIndex = 0;

        this.analyser.fftSize = this.fftSize;
        this.analyser.getByteFrequencyData(dataArray);

        for (let i = barIncrement; i < totalSteps; i += barIncrement) {
            //Get average value for frequencies in range
            let targetFrequency = stepsToFrequency(i);
            let targetIndex = Math.round(targetFrequency / frequencyChunkSize);

            if (targetIndex > bufferLength - 1) {
                targetIndex = bufferLength - 1;
            } else if (targetIndex < 0) {
                targetIndex = 0;
            }

            let averageValue = average(
                dataArray.slice(lastTargetIndex, targetIndex)
            );

            //Add average value to array
            frequencyAverages.push(averageValue);

            //Update target index
            lastTargetIndex = targetIndex;
        }

        return frequencyAverages;
    }

    draw() {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");

        if (!context) {
            return;
        }

        const numBars = this.numColumns ?? DEFAULT_SIZE;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const gap = 2;
        const barWidth = (canvasWidth - numBars * gap) / numBars;

        let barHeight;
        let x = 0;

        //Clear frame
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //Set Background
        this._setBackgroundFillStyle(context);

        //Get Fill Style
        let barColor: AudioVisualizerFillColor;
        if (!this.color) {
            let canvasStyle = this._getCanvasStyle();
            barColor = canvasStyle
                ? canvasStyle.getPropertyValue("color")
                : DEFAULT_COLOR;
        } else {
            barColor = this.color;
        }

        let midX = canvasWidth / 2;

        let fillStyle = this._getFillStyleFromColor(barColor, [
            midX,
            0,
            midX,
            canvasHeight,
        ]);
        if (!fillStyle) {
            fillStyle = DEFAULT_COLOR;
        }
        context.fillStyle = fillStyle;

        //Draw Bars
        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion = frequencyDataToDecibel(averageValue) * -1;
            barHeight = heightProportion * canvasHeight;
            this.beforeDraw(context, this.canvas);
            this._fillFrequencyBar(x, barHeight, barWidth);
            x += barWidth + gap; // Gives space between each bar
        }
    }

    /**
     *
     * @param x The x position to start drawing the bar
     * @param y The y position to start drawing the bar. Will be equal to height of the bar
     * @param barWidth The width of the bar
     * @returns
     */
    protected _fillFrequencyBar(x: number, y: number, barWidth: number) {
        let context = this._get2DContext();
        if (!context) {
            return null;
        }

        context.fillRect(
            x,
            y + CANVAS_PADDING_TOP,
            barWidth,
            this.canvas.height - y - CANVAS_PADDING_TOP
        );
    }
}
