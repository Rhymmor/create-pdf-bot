import * as path from 'path';
import * as PdfKit from 'pdfkit';
import * as fs from 'fs';

// A4 size. TODO: support more pdf sizes
const width = 595;
const height = 842;

export class PdfCreator {
    private defaultName: string;
    
    constructor(defaultName: string) {
        this.defaultName = defaultName;
    }

    create = (photos: Buffer[]) => {
        const pdf = new PdfKit({layout: 'portrait', size: [width, height]});
        const pdfPath = path.join(process.cwd(), this.defaultName);
        pdf.pipe(fs.createWriteStream(pdfPath));
        this.addPhotosToPdf(pdf, photos);
        pdf.end();

        return pdfPath;
    }

    private addPhotosToPdf(pdf: PDFKit.PDFDocument, photos: Buffer[]) {
        let photo = photos.shift();
        pdf.image(photo, 0, 0, {width, height});
        while (photo = photos.shift()) {
            pdf.addPage();
            pdf.image(photo, 0, 0, {width, height});
        }
    }
}