
const TelegramBot = require('telegraf');
import { Readable } from 'stream';
import * as PdfKit from 'pdfkit';
import * as fs from 'fs';
import axios from 'axios';

const token_env = 'BOT_TOKEN';
const token = process.env[token_env];
// A4 size. TODO: support more pdf sizes
const width = 595;
const height = 842;

if (!token) {
    throw `Please, initialize ${token_env} environment variable`;
}

class CreatePdfBot {
    private bot: any;
    private media: Promise<Buffer>[];

    constructor(token: string) {
        this.media = [];
        this.bot = new TelegramBot(token);
        this.bot.on('photo', this.handlePhotoMsg);
        this.bot.command('end', this.handleEndCommand);
    }

    public start() {
        this.bot.startPolling();
    }

    private handlePhotoMsg = async (ctx: any) => {
        if (!ctx.update.message.photo) {
            console.log('No message info');
            return;
        }
        const link = await this.bot.telegram.getFileLink(this.getLastPhotoId(ctx));
        this.media.push(this.downloadPhoto(link));
    }

    private downloadPhoto(link: string) {
        return new Promise<Buffer>((resolve, reject) => {
            axios
                .get(link, { responseType: 'arraybuffer' })
                .then(res => {
                    resolve(new Buffer(res.data, 'binary'));
                })
                .catch(reject);
        });
    }

    private getLastPhotoId = (ctx: any): string => {
        //TODO: give an option to choose photo quality
        return ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id;
    }

    private handleEndCommand = async (ctx: any) => {
        const photos = await Promise.all(this.media);
        const pdf = this.createPdf(photos);
        ctx.replyWithDocument({source: pdf, filename: 'images.pdf'})
    }

    private createPdf = (photos: Buffer[]) => {
        const pdf = new PdfKit({layout: 'portrait', size: [width, height]});
        // TODO: remove hardcoded name
        const pdfPath = process.cwd() + '/images.pdf';

        pdf.pipe(fs.createWriteStream(pdfPath));
        this.addPhotosToPdf(pdf, photos);
        pdf.end();

        return pdfPath;
    }

    private addPhotosToPdf(pdf: PDFKit.PDFDocument, photos: Buffer[]) {
        let photo: Buffer = photos.shift();
        pdf.image(photo, 0, 0, {width, height});
        while (photo = photos.shift()) {
            pdf.addPage();
            pdf.image(photo, 0, 0, {width, height});
        }
    }
}

const bot = new CreatePdfBot(token);
try {
    bot.start();
} catch (e) {
    console.error(e);
}