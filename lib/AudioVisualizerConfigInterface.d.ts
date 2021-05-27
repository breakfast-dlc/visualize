import { BeforeDrawCallback, ModifyBackgroundCallback, AudioVisualizerFillColor } from "./types";
export interface AudioVisualizerConfigInterface {
    fps?: number;
    aspectRatio?: {
        height: number;
        width: number;
    };
    backgroundColor?: AudioVisualizerFillColor;
    color?: AudioVisualizerFillColor;
    beforeDraw?: BeforeDrawCallback;
    modifyBackground?: ModifyBackgroundCallback;
}
