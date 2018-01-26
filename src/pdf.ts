import * as path from 'path';
import * as PdfKit from 'pdfkit';
import * as fs from 'fs';
import { logger } from './logger';
import { ImageEntity } from './image';
import { UseString, maxBy } from './utils';

export enum PdfSize {
    A4 = "A4",
    Auto = "Auto"
}

interface Size {
    width: number;
    height: number;
}

const PdfSizePx: UseString<PdfSize, Size> = {
    A4: { width: 595, height: 842 },
    Auto: { width: 0, height: 0 }
};


export class PdfCreator {
    private defaultName: string;

    constructor(defaultName: string) {
        this.defaultName = defaultName;
    }

    private getSize(type: PdfSize, photos: ImageEntity[]): Size {
        if (type !== PdfSize.Auto) {
            return PdfSizePx[type];
        }
        const maxSize = maxBy(photos, x => x.height);
        if (!maxSize) {
            logger.error(`Error while trying to get max size of photos`, photos);
            return PdfSizePx.A4;
        }
        return {height: maxSize.height, width: maxSize.width};
    }

    create = (type: PdfSize, dir: string, photos: ImageEntity[]) => {
        return new Promise<string>(async (resolve, _reject) => {
            logger.info(`Creating pdf in directory ${dir}`);
            const size = this.getSize(type, photos);
            const pdf = new PdfKit({layout: 'portrait', size: [size.width, size.height]});
            const pdfPath = path.join(dir, this.defaultName);
    
            const stream = fs.createWriteStream(pdfPath);
            stream.on('finish', () => {
                logger.info(`Created pdf in directory ${dir}: ${pdfPath}`);
                resolve(pdfPath);
            });
            pdf.pipe(stream);
            await this.addPhotosToPdf(pdf, photos, size);
            pdf.end();
        })
    }

    private async addPhotosToPdf(pdf: PDFKit.PDFDocument, photos: ImageEntity[], size: Size) {
        let photo = photos.shift();
        if (!photo) { return };

        pdf.image(photo.path, 0, 0, size);
        while (photo = photos.shift()) {
            pdf.addPage();
            pdf.image(photo.path, 0, 0, size);
        }
    }
}