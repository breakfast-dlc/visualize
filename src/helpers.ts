//There tends to be relatively low values above 12 khz
export const MAX_FREQUENCY = 12000;

export const MAX_FREQUENCY_DATA_VALUE = 255;

export const MIN_FREQUENCY = 20;

export const MIN_FREQUENCY_DATA_VALUE = 1;

export const MID_FREQUENCY_DATA_VALUE = 255 / 2;

/*
    Canvas Constants
*/

export const CANVAS_PADDING_TOP = 0;

/**
 * Get the number of steps from the minimum frequency according to the 12 tone scale
 * @param {number} frequency The target frequency
 */
export const getSteps = (frequency: number) => {
    return Math.log2(frequency / MIN_FREQUENCY) * 12;
};

/**
 * Converts the number of steps up the 12 tone scale to their corresponding frequency
 * @param {number} steps The number of steps up the 12 tone scale
 */
export const stepsToFrequency = (steps: number) => {
    return 2 ** (steps / 12) * MIN_FREQUENCY;
};

export const average = (array: Uint8Array) => {
    if (!array || array.length === 0) {
        return 0;
    }

    return array.reduce((a, b) => a + b) / array.length;
};

/**
 * Converts the given frequency power value to a decibel based on the maximum possible frequency power value
 * @param frequencyDataValue
 * @returns
 */
export const frequencyDataToDecibel = (frequencyDataValue: number) => {
    if (frequencyDataValue < MIN_FREQUENCY_DATA_VALUE) {
        frequencyDataValue = MIN_FREQUENCY_DATA_VALUE;
    }
    return Math.log10(frequencyDataValue / MAX_FREQUENCY_DATA_VALUE);
};
