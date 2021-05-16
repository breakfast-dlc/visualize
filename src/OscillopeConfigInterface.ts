import { AudioVisualizerConfigInterface } from "./AudioVisualizerConfigInterface";

export interface OscillopeConfigInterface
    extends AudioVisualizerConfigInterface {
    backgroundColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}
