import { AudioVisualizerFillColor } from "./AudioVisualizer";
import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
import { CANVAS_PADDING_TOP_RATIO } from "./helpers";

const DEFAULT_LINE_WIDTH = 3;

/**
 * Defines a configuration that can be passed to a FrequencyCurve when it is first created
 */
interface FrequencyCurveConfig extends FrequencyGraphConfig {
    /**
     * (Optional) The width of the curve. Defaults to 3;
     */
    lineWidth?: number;

    /**
     * (Optional) The color to use to fill underneath the curve
     */
    fillColor?: AudioVisualizerFillColor;
}

export class FrequencyCurve extends FrequencyGraph {
    /**
     * The width of the curve
     */
    lineWidth: number;

    fillColor?: AudioVisualizerFillColor;

    constructor(config: FrequencyCurveConfig = {}) {
        super(config);
        this.lineWidth = config.lineWidth ?? DEFAULT_LINE_WIDTH;
        this.fillColor = config.fillColor;
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
        const barWidth = canvasWidth / numBars;
        let x = 0;

        //Clear frame
        this._clearCanvas();

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
        this._applyForegroundFilters(context);

        context.beginPath();
        context.moveTo(0, this.canvas.height);

        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion =
                this._getFrequencyDecibelValueProportion(averageValue);
            let y = heightProportion * canvasHeight;
            if (y < canvasHeight - 1 && y !== 0) {
                context.lineTo(x, canvasHeight - y * CANVAS_PADDING_TOP_RATIO);
            }

            x += barWidth;
        }

        //Draw Curve
        context.lineTo(this.canvas.width, this.canvas.height);
        context.stroke();

        if (this.fillColor) {
            //Fill Curve
            context.fillStyle =
                this._getFillStyleFromColor(this.fillColor, [
                    midpoint,
                    0,
                    midpoint,
                    canvasHeight,
                ]) ?? "black";
            context.closePath();
            context.fill();
        }
    }
}
