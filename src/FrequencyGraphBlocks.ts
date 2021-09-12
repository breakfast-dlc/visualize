import { FrequencyGraph, FrequencyGraphConfig } from "./FrequencyGraph";
import { CANVAS_PADDING_TOP_RATIO } from "./helpers";

const DEFAULT_ROW_COUNT = 32;
const DEFAULT_GAP_SIZE = 4;

/**
 * Defines a configuration that can be passed to a FrequencyGraphBlocks when it is first created
 */
interface FrequencyGraphBlocksConfig extends FrequencyGraphConfig {
    /**
     * (Optional) The number of rows to use in the visualization. In other words, the
     * number of blocks each column will be split into. Defaults to 32
     */
    rowCount?: number;
}

export class FrequencyGraphBlocks extends FrequencyGraph {
    /**
     * The number of rows to use in the visualization. In other words, the
     * number of blocks each column will be split into
     */
    rowCount?: number;

    constructor(config: FrequencyGraphBlocksConfig = {}) {
        super(config);
        this.rowCount = config.rowCount;
        this.gap = config.gap ?? DEFAULT_GAP_SIZE; //Default gap size for FrequencyGraphBlocks
    }

    /**
     * @see AudioVisualizer
     */
    protected _draw() {
        if (!this.canvas) {
            return;
        }

        const context = this._get2DContext();
        if (!context) {
            return;
        }

        const numBars = this.columnCount ?? FrequencyGraphBlocks._DEFAULT_COLUMN_COUNT;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        let gapSize = this.gap;
        let totalGapAmount = (numBars - 1) * gapSize;
        const barWidth = (canvasWidth - totalGapAmount) / numBars;

        let x = 0;

        const canvasStyle = window.getComputedStyle(this.canvas);

        //Clear frame
        this._clearCanvas();

        //Set Background
        this._setBackgroundFillStyle(context);

        //Get fill and stroke from element
        const barColor = this.color ?? canvasStyle.getPropertyValue("color");

        for (let averageValue of this._getFrequencyAverages()) {
            let heightProportion = this._getFrequencyDecibelValueProportion(averageValue);
            let numRows = this.rowCount ?? DEFAULT_ROW_COUNT;
            let blockHeight = (canvasHeight - numRows * gapSize) / numRows;

            let heightRemaining =
                heightProportion * canvasHeight * CANVAS_PADDING_TOP_RATIO;

            let y = canvasHeight;

            while (heightRemaining > blockHeight) {
                if (Array.isArray(barColor)) {
                    let blockGroupSize = numRows / barColor.length;
                    let targetColorIndex = 0;
                    for (let j = barColor.length - 1; j >= 0; j--) {
                        if (y > j * blockGroupSize * (blockHeight + gapSize) - gapSize) {
                            targetColorIndex = j;
                            break;
                        }
                    }
                    context.fillStyle = barColor[targetColorIndex];
                } else {
                    context.fillStyle = barColor;
                }

                this._applyForegroundFilters(context);
                context.fillRect(x, y, barWidth, blockHeight);
                y = y - blockHeight - gapSize;
                heightRemaining = heightRemaining - blockHeight - gapSize;
            }

            x += barWidth + gapSize; // Gives 2px space between each bar
        }
    }
}
