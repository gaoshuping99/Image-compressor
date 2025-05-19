export declare class ImageController {
    compress(file: any, quality: string, targetSizeKB: string): Promise<{
        error: string;
        buffer: string;
        size: number;
        mime: string;
    } | {
        buffer: any;
        size: any;
        mime: string;
        error?: undefined;
    }>;
}
