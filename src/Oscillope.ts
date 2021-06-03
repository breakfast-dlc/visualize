import { AudioVisualizer, AudioVisualizerConfig } from "./AudioVisualizer";

const DEFAULT_STROKE_WIDTH = 3;

/**
 * Defines a configuration that can be passed to an Oscillope when it is first created
 */
export interface OscillopeConfig extends AudioVisualizerConfig {
    /**
     * (Optional) The width of the Oscillope's line in pixels. Defaults to 3.
     */
    lineWidth?: number;
}

/**
 * Generates an Oscillope visualization
 */
export class Oscillope extends AudioVisualizer {
    /**
     * The width of the Oscillope's line
     */
    lineWidth: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: OscillopeConfig = {}
    ) {
        super(analyser, canvas, config);

        if (config) {
            this.lineWidth = config.lineWidth ?? DEFAULT_STROKE_WIDTH;
        } else {
            this.lineWidth = DEFAULT_STROKE_WIDTH;
        }

        this._fftSize = 4096;
    }

    /**
     * @see AudioVisualizer
     */
    protected _draw() {
        const canvas = this.canvas;
        const context = this._get2DContext();

        if (!context) {
            return;
        }

        //Clear frame
        context.clearRect(0, 0, canvas.width, canvas.height);

        this._setBackgroundFillStyle(context);

        this.analyser.fftSize = this.fftSize;
        let bufferLength = this.analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);

        this.analyser.getByteTimeDomainData(dataArray);
        context.lineWidth = this.lineWidth;

        const canvasStyle = this._getCanvasStyle();

        //Get fill and stroke from element
        let midpoint = canvas.width / 2;
        const strokeStyle = this._getFillStyleFromColor(
            this.color ?? canvasStyle.getPropertyValue("color"),
            [
                midpoint,
                canvas.height / 3,
                midpoint,
                canvas.height - canvas.height / 3,
            ]
        );

        if (!strokeStyle) {
            return;
        }

        context.strokeStyle = strokeStyle;

        this._applyForegroundFilters(context);

        context.beginPath();

        let sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = (v * canvas.height) / 2;

            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }

            x += sliceWidth;
        }

        context.lineTo(this.canvas.width, this.canvas.height / 2);
        context.stroke();
    }
}
