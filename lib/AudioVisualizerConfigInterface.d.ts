import { FftSize, BeforeDrawCallback, ModifyBackgroundCallback } from "./types";
export interface AudioVisualizerConfigInterface {
    fps?: number;
    aspectRatio?: {
        height: number;
        width: number;
    };
    fftSize?: FftSize;
    backgroundColor?: string;
    color?: string;
    beforeDraw?: BeforeDrawCallback;
    modifyBackground?: ModifyBackgroundCallback;
}
