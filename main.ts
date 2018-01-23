import * as TelegramBot from 'node-telegram-bot-api';
import { Readable } from 'stream';
import * as PdfKit from 'pdfkit';
import * as fs from 'fs';

interface ExtendedTelegramBot extends TelegramBot {
    on(event: "photo", listener: (msg: TelegramBot.Message) => void): this;
    getFileStream(fileid: string, options?: any): Readable;
}

const token_env = 'BOT_TOKEN';
const token = process.env[token_env];
const width = 595;
const height = 842;

if (!token) {
    throw `Please, initialize ${token_env} environment variable`;
}

const bot = new TelegramBot(token, {polling: true}) as ExtendedTelegramBot;

bot.onText(/\/start/, msg => {
    //TODO: replace with logger
    console.log(msg);
})

bot.on('photo', async msg => {
    if (!msg.photo) {
        console.log('No message info');
    }
    const stream = bot.getFileStream(msg.photo[msg.photo.length - 1].file_id);
    let buffer: Buffer;
    stream.on('data', chunk => {
        console.log(chunk);
        if (Buffer.isBuffer(chunk)) {
            if (!buffer) {
                buffer = chunk;
            } else {
                buffer = Buffer.concat([buffer, chunk]);
            }
        }
    });
    stream.on('end', () => {
        console.log('end');
        const doc = new PdfKit({layout: 'portrait', size: [width, height]});
        console.log(process.cwd() + '/example.pdf');
        doc.pipe(fs.createWriteStream(process.cwd() + '/example.pdf'));
        doc.image(buffer, 0, 0, {width, height});
        doc.end();
    });
    console.log(msg);
})