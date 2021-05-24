import { AudioVisualizer } from "./AudioVisualizer";
import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";
import { FrequencyGraphFillType, AudioVisualizerFillColor } from "./types";

/**
 * The maximum frequency the bar graph will chart
 */
const MAX_FREQUENCY = 20000;
const MIN_FREQUENCY = 20;
const MAX_FREQUENCY_DATA_VALUE = 255;
const MIN_FREQUENCY_DATA_VALUE = 1;
const DEFAULT_SIZE = 32;
const DEFAULT_COLOR = "black";
const UPPER_PADDING = 50;

/**
 * Get the number of steps from the minimum frequency according to the 12 tone scale
 * @param {number} frequency The target frequency
 */
const getSteps = (frequency: number) => {
    return Math.log2(frequency / MIN_FREQUENCY) * 12;
};

/**
 * Converts the number of steps up the 12 tone scale to their corresponding frequency
 * @param {number} steps The number of steps up the 12 tone scale
 */
const stepsToFrequency = (steps: number) => {
    return 2 ** (steps / 12) * MIN_FREQUENCY;
};

const average = (array: Uint8Array) => {
    if (!array || array.length === 0) {
        return 0;
    }

    return array.reduce((a, b) => a + b) / array.length;
};

const frequencyDataToDecibel = (frequencyDataValue: number) => {
    if (frequencyDataValue < MIN_FREQUENCY_DATA_VALUE) {
        frequencyDataValue = MIN_FREQUENCY_DATA_VALUE;
    }
    return 10 * Math.log10(MIN_FREQUENCY_DATA_VALUE / frequencyDataValue);
};

const MAX_DECIBEL = frequencyDataToDecibel(MAX_FREQUENCY_DATA_VALUE);

type FrequencyGraphType =
    | "simple-bar-graph"
    | "block-bar-graph"
    | "frequency-curve";

export interface FrequencyGraphConfig extends AudioVisualizerConfigInterface {
    numBars?: number;
    type?: FrequencyGraphType;
    fillType?: FrequencyGraphFillType;
}

export class FrequencyGraph extends AudioVisualizer {
    static SIMPLE_BAR_GRAPH: FrequencyGraphType = "simple-bar-graph";
    static BLOCK_BAR_GRAPH: FrequencyGraphType = "block-bar-graph";
    static FREQUENCY_CURVE: FrequencyGraphType = "frequency-curve";

    numBars: number;

    private _type: FrequencyGraphType = FrequencyGraph.SIMPLE_BAR_GRAPH;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: FrequencyGraphConfig = {}
    ) {
        super(analyser, canvas, config);

        this.numBars = config.numBars ?? DEFAULT_SIZE;
        this.type = config.type ?? FrequencyGraph.SIMPLE_BAR_GRAPH;
        this.fftSize = 16384;
    }

    protected _getFrequencyAverages(): Array<number> {
        const frequencyAverages = [];
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const totalSteps = getSteps(MAX_FREQUENCY);
        const numBars = this.numBars ?? DEFAULT_SIZE;
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

    drawBarGraph() {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");

        if (!context) {
            return;
        }

        const numBars = this.numBars ?? DEFAULT_SIZE;
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

        let fillStyle = this._getFillStyleFromColor(
            barColor,
            canvasWidth,
            canvasHeight
        );
        if (!fillStyle) {
            fillStyle = DEFAULT_COLOR;
        }
        context.fillStyle = fillStyle;

        //Draw Bars
        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion =
                frequencyDataToDecibel(averageValue) / MAX_DECIBEL;

            barHeight = heightProportion * canvasHeight;

            this.beforeDraw(context, this.canvas);

            context.fillRect(
                x,
                canvasHeight - barHeight + UPPER_PADDING,
                barWidth,
                barHeight - UPPER_PADDING
            );
            x += barWidth + gap; // Gives space between each bar
        }
    }

    drawBarGraphBlocks = () => {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");
        if (!context) {
            return;
        }

        this.analyser.fftSize = this.fftSize;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const numBars = this.numBars ?? DEFAULT_SIZE;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        let gapSize = 2;

        const barWidth = (canvasWidth - numBars * gapSize) / numBars;

        let barHeight;
        let x = 0;

        this.analyser.getByteFrequencyData(dataArray);
        const canvasStyle = window.getComputedStyle(this.canvas);

        this._setBackgroundFillStyle(context);
        //Get fill and stroke from element

        const barColor = this.color ?? canvasStyle.getPropertyValue("color");

        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion =
                frequencyDataToDecibel(averageValue) / MAX_DECIBEL;
            let numBlocks = 32;
            let blockHeight = (canvasHeight - numBlocks * gapSize) / numBlocks;

            let heightRemaining = heightProportion * canvasHeight;

            let y = canvasHeight;

            while (heightRemaining > blockHeight) {
                if (Array.isArray(barColor)) {
                    let heightIncrement = canvasHeight / barColor.length;
                    let targetColorIndex = 0;
                    for (let j = barColor.length - 1; j >= 0; j--) {
                        if (y > heightIncrement * j) {
                            targetColorIndex = j;
                            break;
                        }
                    }
                    context.fillStyle = barColor[targetColorIndex];
                } else {
                    context.fillStyle = barColor;
                }

                this.beforeDraw(context, this.canvas);

                context.fillRect(x, y, barWidth, blockHeight);
                y = y - blockHeight - gapSize;
                heightRemaining = heightRemaining - blockHeight - gapSize;
            }

            context.fillRect(
                x,
                y + (blockHeight - heightRemaining),
                barWidth,
                heightRemaining
            );

            x += barWidth + gapSize; // Gives 2px space between each bar
        }
    };

    // drawCurve = () => {
    //     if (!this.canvas) {
    //         return;
    //     }

    //     const context = this.canvas.getContext("2d");

    //     if (!context) {
    //         return;
    //     }

    //     this.analyser.fftSize = this.fftSize;
    //     const bufferLength = this.analyser.frequencyBinCount;
    //     const dataArray = new Uint8Array(bufferLength);
    //     const WIDTH = this.canvas.width;
    //     const HEIGHT = this.canvas.height;
    //     const totalSteps = getSteps(MAX_FREQUENCY);
    //     const numBars = 1024;
    //     const barIncrement = totalSteps / numBars;
    //     const frequencyChunkSize = MAX_FREQUENCY / bufferLength;
    //     let lastTargetIndex = 0;
    //     const barWidth = WIDTH / numBars;

    //     this.analyser.getByteFrequencyData(dataArray);
    //     const canvasStyle = window.getComputedStyle(this.canvas);

    //     //Get fill and stroke from element
    //     const backgroundColor =
    //         this.backgroundColor ??
    //         canvasStyle.getPropertyValue("background-color");
    //     const strokeColor = this.color ?? canvasStyle.getPropertyValue("color");
    //     context.lineWidth = 3;
    //     context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //     context.fillStyle = backgroundColor;
    //     context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //     context.strokeStyle = strokeColor;

    //     context.beginPath();

    //     let sliceWidth = this.canvas.width / bufferLength;
    //     let x = 0;
    //     context.moveTo(0, this.canvas.height);

    //     for (let i = 0; i < totalSteps; i += barIncrement) {
    //         let targetFrequency = stepsToFrequency(i);

    //         let targetIndex = Math.round(targetFrequency / frequencyChunkSize);

    //         if (targetIndex > bufferLength - 1) {
    //             targetIndex = bufferLength - 1;
    //         } else if (targetIndex < 0) {
    //             targetIndex = 0;
    //         }

    //         let averageValue = average(
    //             dataArray.slice(lastTargetIndex, targetIndex)
    //         );
    //         lastTargetIndex = targetIndex;

    //         let heightProportion =
    //             frequencyDataToDecibel(averageValue) / MAX_DECIBEL;

    //         let y = HEIGHT - heightProportion * HEIGHT;

    //         context.lineTo(x, y);
    //         x += barWidth + 2; // Gives 2px space between each bar
    //     }
    //     context.lineTo(this.canvas.width, this.canvas.height);
    //     // context.closePath();
    //     // context.fillStyle = strokeColor;
    //     // context.fill();

    //     this.beforeDraw(this.canvas);
    //     context.stroke();
    // };

    public get type(): FrequencyGraphType {
        return this._type;
    }

    public set type(value: FrequencyGraphType) {
        this._type = value;
        switch (value) {
            case FrequencyGraph.SIMPLE_BAR_GRAPH:
                this.draw = this.drawBarGraph;
                break;
            case FrequencyGraph.BLOCK_BAR_GRAPH:
                this.draw = this.drawBarGraphBlocks;
                break;
            // case FrequencyGraph.FREQUENCY_CURVE:
            //     this.draw = this.drawCurve;
            //     break;
            default:
                this._type = FrequencyGraph.SIMPLE_BAR_GRAPH;
                this.draw = this.drawBarGraph;
        }
    }
}
