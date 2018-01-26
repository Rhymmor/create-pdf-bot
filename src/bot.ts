const TelegramBot = require('telegraf');
const Markup = require('telegraf/markup');
import { PdfCreator } from './pdf';
import { downloadBinary } from './utils';

export class CreatePdfBot {
    private static CREATE_LABEL: string = '✅ Create';
    private static PDF_NAME = 'images.pdf';
    private bot: any;
    private media: Promise<Buffer>[];
    private pdfCreator: PdfCreator;

    constructor(token: string) {
        this.media = [];
        this.pdfCreator = new PdfCreator(CreatePdfBot.PDF_NAME);

        this.bot = new TelegramBot(token);
        this.bot.on('photo', this.handlePhotoMsg);
        this.bot.command('start', this.handleStartCommand);
        this.bot.command('help', this.handleHelpCommand);
        this.bot.command('end', this.handleEndCommand);
        this.bot.hears(CreatePdfBot.CREATE_LABEL, ctx => {
            ctx.reply('Cool! Collecting pdf from the images above.');
            this.handleEndCommand(ctx);
        });
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
        this.media.push(downloadBinary(link));
        return ctx.reply('a', Markup
            .keyboard([[CreatePdfBot.CREATE_LABEL]])
            .oneTime()
            .resize()
            .extra()
        );
    }

    private getLastPhotoId = (ctx: any): string => {
        //TODO: give an option to choose photo quality
        return ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id;
    }

    private getUserId = (ctx: any): string => {
        return String(ctx.update.message.from.id);
    }

    private handleEndCommand = async (ctx: any) => {
        const images = await Promise.all(this.media);
        const id = this.getUserId(ctx);
        const pdf = await this.pdfCreator.create(id, images);
        ctx.replyWithDocument({source: pdf, filename: CreatePdfBot.PDF_NAME});
        this.pdfCreator.clean(id);
    }

    private handleStartCommand = (ctx: any) => {
        return ctx.reply(this.showHelp());
    }

    private handleHelpCommand = (ctx: any) => {
        return ctx.reply(this.showHelp());
    }

    private showHelp() {
        return `Hello, stranger! I can help you to create pdf from images.
        To do that just send images to me, wait them to upload and then click create button.`;
    }
}