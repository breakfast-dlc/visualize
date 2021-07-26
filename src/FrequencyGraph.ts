import {
    AudioVisualizer,
    AudioVisualizerConfig,
    AudioVisualizerFillColor,
} from "./AudioVisualizer";
import {
    average,
    CANVAS_PADDING_TOP_RATIO,
    getSteps,
    MAX_VISUALIZER_FREQUENCY,
    MAX_FREQUENCY_DECIBEL_VALUE,
    stepsToFrequency,
} from "./helpers";

const DEFAULT_COLUMN_COUNT = 32;
const DEFAULT_COLOR = "black";
const DEFAULT_GAP_SIZE = 2;

/**
 * Defines a configuration that can be passed to a FrequencyGraph when it is first created
 */
export interface FrequencyGraphConfig extends AudioVisualizerConfig {
    /**
     * (Optional) The number of columns or bars to use in the visualization. Each bar will represent a
     * different part of the frequency range. Defaults to 32
     */
    columnCount?: number;

    /**
     * (Optional) The amount of space between each column
     */
    gap?: number;
}

export class FrequencyGraph extends AudioVisualizer {
    static _DEFAULT_COLUMN_COUNT = DEFAULT_COLUMN_COUNT;

    /**
     * The number of columns or bars to use in the visualization. Each bar represents
     * different part of the frequency range
     */
    columnCount: number;

    /**
     * The amount of space between each column
     */
    gap: number;

    constructor(config: FrequencyGraphConfig = {}) {
        super(config);

        this.columnCount = config.columnCount ?? DEFAULT_COLUMN_COUNT;
        this.gap = config.gap ?? DEFAULT_GAP_SIZE;
        this._fftSize = 16384;
    }

    /**
     * Returns frequency data from the analyser
     */
    protected _getFrequencyData(): Uint8Array {
        //Make sure the proper fftSize is set
        this.analyser.fftSize = this.fftSize;

        //Get the number of values in the data array
        const bufferLength = this.analyser.frequencyBinCount;

        //Create array to hold the data
        const dataArray = new Uint8Array(bufferLength);

        //Get frequency data
        this.analyser.getByteFrequencyData(dataArray);

        return dataArray;
    }

    /**
     * Returns an array of the average value of each frequency band. The number of frequency bands is equal to columnCount.
     * The frequency averages are sorted from lower frequencies to higher frequencies
     * @returns {number[]}
     */
    protected _getFrequencyAverages(): number[] {
        //Create array for holding the calculated frequency averages
        const frequencyAverages = [];

        //Get the number of values in the data array
        const bufferLength = this.analyser.frequencyBinCount;

        //Get frequency data
        const dataArray = this._getFrequencyData();

        //Get how many bars will be displayed
        const numBars = this.columnCount ?? DEFAULT_COLUMN_COUNT;

        //Get the total number of steps up the 12 tone scale from the min frequency to the max frequency
        const totalSteps = getSteps(MAX_VISUALIZER_FREQUENCY);

        //Calculate how many steps will be included in the range for each bar. This allows us to split the data up according to an exponential scale
        const stepIncrement = totalSteps / numBars;

        //Get size of the frequency range covered by each value in the data array
        const frequencyChunkSize =
            this._getMaxAnalyserFrequency() / bufferLength;

        let lastTargetIndex = 0;

        //Get frequency data
        this.analyser.getByteFrequencyData(dataArray);

        for (let i = 1; i <= numBars; i++) {
            //Get frequency value corresponding from step value
            let targetFrequency = stepsToFrequency(i * stepIncrement);

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
     * Returns the max frequency in the frequency spread returned by the analyser node, equal to half
     * of the audio context sample rate.
     */
    protected _getMaxAnalyserFrequency(): number {
        return this.analyser.context.sampleRate / 2;
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
        const gap = this.gap;
        const totalGapAmount = (numBars - 1) * gap;
        const barWidth = (canvasWidth - totalGapAmount) / numBars;

        let barHeight;

        //Starting x coordinate
        let x = 0;

        //Clear frame
        this._clearCanvas();

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
            barHeight =
                this._getFrequencyDecibelValueProportion(averageValue) *
                canvasHeight *
                CANVAS_PADDING_TOP_RATIO;
            this._applyForegroundFilters(context);
            this._fillFrequencyBar(x, canvasHeight - barHeight, barWidth);
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

        context.fillRect(x, y, barWidth, this.canvas.height - y);
    }

    /**
     * Returns the proportion for the given frequency decibel value when compared to the max frequency decibel value
     * @param value The frequency decibel value
     * @returns The
     */
    protected _getFrequencyDecibelValueProportion(value: number): number {
        return value / MAX_FREQUENCY_DECIBEL_VALUE;
    }
}
