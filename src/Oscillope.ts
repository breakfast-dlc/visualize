import { AudioVisualizer } from "./AudioVisualizer";
import { OscillopeConfigInterface } from "./OscillopeConfigInterface";

const DEFAULT_STROKE_WIDTH = 3;

export class Oscillope extends AudioVisualizer {
    backgroundColor?: string;
    strokeColor?: string;
    strokeWidth: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config?: OscillopeConfigInterface
    ) {
        super(analyser, canvas, config);

        this.backgroundColor = config ? config.backgroundColor : undefined;
        this.strokeColor = config ? config.strokeColor : undefined;
        if (config) {
            this.strokeWidth = config.strokeWidth ?? DEFAULT_STROKE_WIDTH;
        } else {
            this.strokeWidth = DEFAULT_STROKE_WIDTH;
        }
    }

    protected _setUpDraw() {
        const canvas = this.canvas;
        if (!canvas) {
            console.warn("no canvas");
            return;
        }
        const canvasStyle = window.getComputedStyle(canvas);

        //Get fill and stroke from element
        const fillStyle =
            this.backgroundColor ??
            canvasStyle.getPropertyValue("background-color");
        const strokeStyle =
            this.strokeColor ?? canvasStyle.getPropertyValue("color");

        const context = canvas.getContext("2d");

        if (!context) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = fillStyle;
        context.fillRect(0, 0, canvas.width, canvas.height);

        this.analyser.fftSize = this._fftSize;
        let bufferLength = this.analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);

        this.analyser.getByteTimeDomainData(dataArray);
        context.lineWidth = this.strokeWidth;

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
    }

    protected _completeDraw() {
        const context = this.canvas.getContext("2d");

        if (!context) {
            return;
        }

        context.lineTo(this.canvas.width, this.canvas.height / 2);
        context.stroke();
    }
}
