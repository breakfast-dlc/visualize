import { FftSize, BeforeDrawCallback } from "./types";

export interface AudioVisualizerConfigInterface {
    fps?: number;
    aspectRatio?: {
        height: number;
        width: number;
    };
    fftSize?: FftSize;
    beforeDraw?: BeforeDrawCallback;
}
