export declare const MAX_FREQUENCY = 24000;
export declare const MAX_FREQUENCY_DATA_VALUE = 255;
export declare const MIN_FREQUENCY = 20;
export declare const MIN_FREQUENCY_DATA_VALUE = 1;
export declare const MID_FREQUENCY_DATA_VALUE: number;
export declare const CANVAS_PADDING_TOP = 50;
/**
 * Get the number of steps from the minimum frequency according to the 12 tone scale
 * @param {number} frequency The target frequency
 */
export declare const getSteps: (frequency: number) => number;
/**
 * Converts the number of steps up the 12 tone scale to their corresponding frequency
 * @param {number} steps The number of steps up the 12 tone scale
 */
export declare const stepsToFrequency: (steps: number) => number;
export declare const average: (array: Uint8Array) => number;
/**
 * Converts the given frequency power value to a decibel based on the maximum possible frequency power value
 * @param frequencyDataValue
 * @returns
 */
export declare const frequencyDataToDecibel: (frequencyDataValue: number) => number;
