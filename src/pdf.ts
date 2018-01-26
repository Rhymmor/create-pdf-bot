import * as path from 'path';
import * as PdfKit from 'pdfkit';
import * as fs from 'fs';
import { logger } from './logger';

// A4 size. TODO: support more pdf sizes
const width = 595;
const height = 842;

export class PdfCreator {
    private defaultName: string;

    constructor(defaultName: string) {
        this.defaultName = defaultName;
    }

    create = (dir: string, photos: string[]) => {
        return new Promise<string>(async (resolve, _reject) => {
            logger.info(`Creating pdf in directory ${dir}`);
            const pdf = new PdfKit({layout: 'portrait', size: [width, height]});
            const pdfPath = path.join(dir, this.defaultName);
    
            const stream = fs.createWriteStream(pdfPath);
            stream.on('finish', () => {
                logger.info(`Created pdf in directory ${dir}: ${pdfPath}`);
                resolve(pdfPath);
            });
            pdf.pipe(stream);
            this.addPhotosToPdf(pdf, photos);
            pdf.end();
        })
    }

    private addPhotosToPdf(pdf: PDFKit.PDFDocument, photos: string[]) {
        let photo = photos.shift();
        pdf.image(photo, 0, 0, {width, height});
        while (photo = photos.shift()) {
            pdf.addPage();
            pdf.image(photo, 0, 0, {width, height});
        }
    }
}