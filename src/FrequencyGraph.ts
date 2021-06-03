import {
    AudioVisualizer,
    AudioVisualizerConfig,
    AudioVisualizerFillColor,
} from "./AudioVisualizer";
import {
    average,
    CANVAS_PADDING_TOP,
    frequencyDataToDecibel,
    getSteps,
    MAX_FREQUENCY,
    MAX_FREQUENCY_DATA_VALUE,
    MIN_FREQUENCY,
    stepsToFrequency,
} from "./helpers";

const DEFAULT_COLUMN_COUNT = 32;
const DEFAULT_COLOR = "black";

/**
 * Defines a configuration that can be passed to a FrequencyGraph when it is first created
 */
export interface FrequencyGraphConfig extends AudioVisualizerConfig {
    /**
     * (Optional) The number of columns or bars to use in the visualization. Each bar will represent a
     * different part of the frequency range. Defaults to 32
     */
    columnCount?: number;
}

export class FrequencyGraph extends AudioVisualizer {
    static _DEFAULT_COLUMN_COUNT = DEFAULT_COLUMN_COUNT;

    /**
     * The number of columns or bars to use in the visualization. Each bar represents
     * different part of the frequency range
     */
    columnCount: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: FrequencyGraphConfig = {}
    ) {
        super(analyser, canvas, config);

        this.columnCount = config.columnCount ?? DEFAULT_COLUMN_COUNT;
        this._fftSize = 16384;
    }

    /**
     * Returns an array of the average value of each frequency band. The number of frequency bands is equal to columnCount.
     * The frequency averages are sorted from lower frequencies to higher frequencies
     * @returns {number[]}
     */
    protected _getFrequencyAverages(): number[] {
        //Make sure the proper fftSize is set
        this.analyser.fftSize = this.fftSize;

        //Create array for holding the calculated frequency averages
        const frequencyAverages = [];

        //Get the number of values in the data array
        const bufferLength = this.analyser.frequencyBinCount;

        //Create array to hold the data
        const dataArray = new Uint8Array(bufferLength);

        //Get how many bars will be displayed
        const numBars = this.columnCount ?? DEFAULT_COLUMN_COUNT;

        //Get the total number of steps up the 12 tone scale from the min frequency to the max frequency
        const totalSteps = getSteps(MAX_FREQUENCY);

        //Calculate how many steps will be included in the range for each bar. This allows us to split the data up according to an exponential scale
        const barIncrement = totalSteps / numBars;

        //Get size of the frequency range covered by each value in the data array
        const frequencyChunkSize = 22500 / bufferLength; //TODO: Update constructor to create it's own context, then use the contexts sample rate instead of 22,500;

        let lastTargetIndex = 0;

        //Get frequency data
        this.analyser.getByteFrequencyData(dataArray);

        for (let i = barIncrement; i < totalSteps; i += barIncrement) {
            //Get frequency value corresponding from step value
            let targetFrequency = stepsToFrequency(i);

            //Get index in data array for the frequency that is the upper limit of the current frequency range
            let targetIndex = Math.round(targetFrequency / frequencyChunkSize);
            if (targetIndex > bufferLength - 1) {
                targetIndex = bufferLength - 1;
            } else if (targetIndex < 0) {
                targetIndex = 0;
            }

            //Calculate average value of frequency range
            let averageValue = average(
                dataArray.slice(lastTargetIndex, targetIndex)
            );

            //Add average value to array
            frequencyAverages.push(averageValue);

            //Update lastTargetIndex to use for calculating the next range of frequencies
            lastTargetIndex = targetIndex;
        }

        return frequencyAverages;
    }

    /**
     * @see AudioVisualizer
     */
    protected _draw() {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");

        if (!context) {
            return;
        }

        const numBars = this.columnCount ?? DEFAULT_COLUMN_COUNT;
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
            this._applyForegroundFilters(context);
            this._fillFrequencyBar(x, barHeight, barWidth);
            x += barWidth + gap; // Gives space between each bar
        }
    }

    /**
     * Helper function for creating bars in the frequency graph.
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

    protected _getHeightProportionFromFrequencyDecibelValue(
        value: number
    ): number {
        return value / MAX_FREQUENCY_DATA_VALUE;
    }
}
