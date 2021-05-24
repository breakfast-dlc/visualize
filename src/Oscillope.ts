import { AudioVisualizer } from "./AudioVisualizer";
import { OscillopeConfigInterface } from "./OscillopeConfigInterface";

const DEFAULT_STROKE_WIDTH = 3;

export class Oscillope extends AudioVisualizer {
    strokeWidth: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: OscillopeConfigInterface = {}
    ) {
        super(analyser, canvas, config);

        if (config) {
            this.strokeWidth = config.strokeWidth ?? DEFAULT_STROKE_WIDTH;
        } else {
            this.strokeWidth = DEFAULT_STROKE_WIDTH;
        }
    }

    draw() {
        const canvas = this.canvas;
        const context = this._get2DContext();

        if (!context) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        this._setBackgroundFillStyle(context);

        this.analyser.fftSize = this._fftSize;
        let bufferLength = this.analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);

        this.analyser.getByteTimeDomainData(dataArray);
        context.lineWidth = this.strokeWidth;

        const canvasStyle = this._getCanvasStyle();

        //Get fill and stroke from element
        const strokeStyle = this._getFillStyleFromColor(
            this.color ?? canvasStyle.getPropertyValue("color"),
            canvas.width,
            canvas.height
        );

        if (!strokeStyle) {
            return;
        }

        context.strokeStyle = strokeStyle;

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

        this.beforeDraw(context, canvas, dataArray);
        context.stroke();
    }
}
