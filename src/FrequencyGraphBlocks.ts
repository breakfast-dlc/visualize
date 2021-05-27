import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
import { frequencyDataToDecibel } from "./helpers";

const DEFAULT_NUM_ROWS = 32;

interface FrequencyGraphBlocksConfig extends FrequencyGraphConfig {
    numRows?: number;
}

export class FrequencyGraphBlocks extends FrequencyGraph {
    numRows?: number;

    constructor(
        analyser: AnalyserNode,
        canvas: HTMLCanvasElement,
        config: FrequencyGraphBlocksConfig = {}
    ) {
        super(analyser, canvas, config);
        this.numRows = config.numRows;
    }

    draw() {
        if (!this.canvas) {
            return;
        }

        const context = this._get2DContext();
        if (!context) {
            return;
        }

        const numBars =
            this.numColumns ?? FrequencyGraphBlocks._DEFAULT_NUM_BARS;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        let gapSize = 4;

        const barWidth = (canvasWidth - numBars * gapSize) / numBars;

        let x = 0;

        const canvasStyle = window.getComputedStyle(this.canvas);

        this._setBackgroundFillStyle(context);
        //Get fill and stroke from element

        const barColor = this.color ?? canvasStyle.getPropertyValue("color");

        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion = frequencyDataToDecibel(averageValue) * -1;
            let numRows = this.numRows ?? DEFAULT_NUM_ROWS;
            let blockHeight = (canvasHeight - numRows * gapSize) / numRows;

            let heightRemaining =
                canvasHeight - heightProportion * canvasHeight;

            let y = canvasHeight;

            while (heightRemaining > blockHeight) {
                if (Array.isArray(barColor)) {
                    let blockGroupSize = numRows / barColor.length;
                    let targetColorIndex = 0;
                    for (let j = barColor.length - 1; j >= 0; j--) {
                        if (
                            y >
                            j * blockGroupSize * (blockHeight + gapSize) -
                                gapSize
                        ) {
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

            x += barWidth + gapSize; // Gives 2px space between each bar
        }
    }
}
