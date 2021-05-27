import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
import { CANVAS_PADDING_TOP, frequencyDataToDecibel } from "./helpers";

const DEFAULT_LINE_WIDTH = 3;

interface FrequencyCurveConfig extends FrequencyGraphConfig {
    lineWidth?: number;
}

export class FrequencyCurve extends FrequencyGraph {
    lineWidth: number = 10;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: FrequencyCurveConfig = {}
    ) {
        super(analyser, canvas, config);

        this.lineWidth = config.lineWidth ?? DEFAULT_LINE_WIDTH;
    }

    draw() {
        if (!this.canvas) {
            return;
        }
        const context = this.canvas.getContext("2d");
        if (!context) {
            return;
        }

        const WIDTH = this.canvas.width;
        const HEIGHT = this.canvas.height;
        const numBars = this.numColumns;
        const barWidth = WIDTH / numBars;
        const canvasStyle = this._getCanvasStyle();

        this._setBackgroundFillStyle(context);
        const strokeColor = this.color ?? canvasStyle.getPropertyValue("color");
        let midpoint = WIDTH / 2;
        const strokeStyle =
            this._getFillStyleFromColor(strokeColor, [
                midpoint,
                0,
                midpoint,
                HEIGHT,
            ]) ?? "black";
        context.lineWidth = this.lineWidth;

        context.strokeStyle = strokeStyle;
        context.lineCap = "round";
        context.beginPath();

        let x = 0;
        context.moveTo(0, this.canvas.height);

        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion = frequencyDataToDecibel(averageValue) * -1;
            let y = heightProportion * HEIGHT;
            if (y < HEIGHT - 1) {
                context.lineTo(x, y + CANVAS_PADDING_TOP);
            }

            x += barWidth + 2; // Gives 2px space between each bar
        }

        context.lineTo(this.canvas.width, this.canvas.height);
        // context.closePath();
        // context.fillStyle = strokeColor;
        // context.fill();
        this.beforeDraw(context, this.canvas);
        context.stroke();
    }
}
