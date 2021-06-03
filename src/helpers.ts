/**
 * The maximum frequency a visualizer will display. Frequencies above 12kHz can have very low decibels,
 * so setting max to 12kHz for a more symetrical visual
 */
export const MAX_VISUALIZER_FREQUENCY = 12000;

/**
 * The minimum frequency a visualizer will display
 */
export const MIN_VISUALIZER_FREQUENCY = 20;

/**
 * The maximum possible value returned by AnalyserNode.getByteFrequencyData
 */
export const MAX_FREQUENCY_DECIBEL_VALUE = 255;

/**
 * The minimum possible value returned by AnalyserNode.getByteFrequencyData
 */
export const MIN_FREQUENCY_DECIBEL_VALUE = 1;

/**
 * Constant to use when calculating the size of visualization so that there is padding at the top of the canvas
 */
export const CANVAS_PADDING_TOP_RATIO = 0.99;

/**
 * Get the number of steps from the minimum frequency according to the 12 tone scale
 * @param {number} frequency The target frequency
 */
export const getSteps = (frequency: number) => {
    return Math.log2(frequency / MIN_VISUALIZER_FREQUENCY) * 12;
};

/**
 * Converts the number of steps up the 12 tone scale to their corresponding frequency
 * @param {number} steps The number of steps up the 12 tone scale
 */
export const stepsToFrequency = (steps: number) => {
    return 2 ** (steps / 12) * MIN_VISUALIZER_FREQUENCY;
};

/**
 * Returns the average of all the values in Uint8Array
 * @param array The array to average
 * @returns
 */
export const average = (array: Uint8Array) => {
    if (!array || array.length === 0) {
        return 0;
    }

    return array.reduce((a, b) => a + b) / array.length;
};
