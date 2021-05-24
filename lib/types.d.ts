export declare type FftSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;
export declare type BeforeDrawCallback = (context: CanvasRenderingContext2D | WebGL2RenderingContext, canvas: HTMLCanvasElement, data?: any) => void;
export declare type ModifyBackgroundCallback = (context: CanvasRenderingContext2D | WebGL2RenderingContext, canvas: HTMLCanvasElement) => void;
export declare type FrequencyGraphFillType = "solid" | "gradient";
export declare type AudioVisualizerFillColor = string | string[];
