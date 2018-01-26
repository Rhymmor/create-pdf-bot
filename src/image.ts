import { downloadToFile } from "./utils";
import * as sizeOf from 'image-size';

export interface ImageEntity {
    path: string;
    width: number;
    height: number;
    type: string;
}

export async function processImage(link: string, path: string): Promise<ImageEntity> {
    await downloadToFile(link, path);
    const size = await sizeOf(path);
    return {...size, path};
}