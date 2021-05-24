export type FftSize =
    | 16
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 32768;

export type BeforeDrawCallback = (
    context: CanvasRenderingContext2D | WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    data?: any
) => void;

export type ModifyBackgroundCallback = (
    context: CanvasRenderingContext2D | WebGL2RenderingContext,
    canvas: HTMLCanvasElement
) => void;

export type FrequencyGraphFillType = "solid" | "gradient";

export type AudioVisualizerFillColor = string | string[];
