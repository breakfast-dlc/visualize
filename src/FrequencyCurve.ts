import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
import {
    CANVAS_PADDING_TOP,
    frequencyDataToDecibel,
    MAX_FREQUENCY_DATA_VALUE,
} from "./helpers";

const DEFAULT_LINE_WIDTH = 3;

/**
 * Defines a configuration that can be passed to a FrequencyCurve when it is first created
 */
interface FrequencyCurveConfig extends FrequencyGraphConfig {
    /**
     * (Optional) The width of the curve. Defaults to 3;
     */
    lineWidth?: number;
}

export class FrequencyCurve extends FrequencyGraph {
    /**
     * The width of the curve
     */
    lineWidth: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: FrequencyCurveConfig = {}
    ) {
        super(analyser, canvas, config);
        this.lineWidth = config.lineWidth ?? DEFAULT_LINE_WIDTH;
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

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const numBars = this.columnCount;
        const gap = 2;
        const barWidth = (canvasWidth - numBars * gap) / numBars;
        let x = 0;

        //Clear frame
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //Set Background
        this._setBackgroundFillStyle(context);

        //Set up Foreground
        const canvasStyle = this._getCanvasStyle();
        const strokeColor = this.color ?? canvasStyle.getPropertyValue("color");
        let midpoint = canvasWidth / 2;

        const strokeStyle =
            this._getFillStyleFromColor(strokeColor, [
                midpoint,
                0,
                midpoint,
                canvasHeight,
            ]) ?? "black";

        context.lineWidth = this.lineWidth;
        context.strokeStyle = strokeStyle;
        context.lineCap = "round";
        this._applyForegroundFilters(context);

        context.beginPath();
        context.moveTo(0, this.canvas.height);

        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion = averageValue / MAX_FREQUENCY_DATA_VALUE;
            let y = heightProportion * canvasHeight;
            if (y < canvasHeight - 1) {
                context.lineTo(x, y + CANVAS_PADDING_TOP);
            }

            x += barWidth + gap;
        }

        context.lineTo(this.canvas.width, this.canvas.height);
        context.stroke();
    }
}
