import * as path from 'path';
import * as PdfKit from 'pdfkit';
import * as fs from 'fs';
import { TmpDirsWatcher } from './tmpDirs';

// A4 size. TODO: support more pdf sizes
const width = 595;
const height = 842;

export class PdfCreator {
    private defaultName: string;
    private dirsWatcher: TmpDirsWatcher;

    constructor(defaultName: string) {
        this.defaultName = defaultName;
        this.dirsWatcher = new TmpDirsWatcher();
    }

    create = async (id: string, photos: Buffer[]) => {
        console.log(`Creating pdf for id ${id}`);
        const pdfDir = await this.dirsWatcher.prepareIdDir(id);
        const pdf = new PdfKit({layout: 'portrait', size: [width, height]});
        const pdfPath = path.join(pdfDir, this.defaultName);
        pdf.pipe(fs.createWriteStream(pdfPath));
        this.addPhotosToPdf(pdf, photos);
        pdf.end();

        console.log(`Created pdf for id ${id}: ${pdfPath}`);
        return pdfPath;
    }

    clean(id: string) {
        this.dirsWatcher.clean(id);
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