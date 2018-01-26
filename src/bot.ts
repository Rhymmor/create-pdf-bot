const TelegramBot = require('telegraf');
const Markup = require('telegraf/markup');
import { PdfCreator } from './pdf';
import { downloadToFile } from './utils';
import { logger } from './logger';
import { TmpDirsWatcher } from './tmpDirs';
import {generate as generateId} from 'shortid';
import * as path from 'path';

export class CreatePdfBot {
    private static CREATE_LABEL: string = '✅ Create';
    private static PDF_NAME = 'images.pdf';
    private bot: any;
    private media: Promise<string>[];
    private pdfCreator: PdfCreator;
    private dirsWatcher: TmpDirsWatcher;

    constructor(token: string) {
        this.media = [];
        this.pdfCreator = new PdfCreator(CreatePdfBot.PDF_NAME);
        this.dirsWatcher = new TmpDirsWatcher();

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
        this.bot.catch(logger.error);
        this.bot.startPolling();
    }

    private handlePhotoMsg = async (ctx: any) => {
        if (!ctx.update.message.photo) {
            logger.error('No message info', ctx.update);
            return;
        }
        const link = await this.bot.telegram.getFileLink(this.getLastPhotoId(ctx));

        const id = this.getUserId(ctx);
        const dir = this.dirsWatcher.isIdActive(id)
            ? this.dirsWatcher.getIdTmpDir(id)
            : await this.dirsWatcher.prepareIdDir(id);
        const filepath = path.join(dir, generateId());
        this.media.push(downloadToFile(link, filepath));

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
        this.clean(id);
    }

    private clean(id: string) {
        this.dirsWatcher.clean(id);
    }

    public cleanup() {
        return this.dirsWatcher.cleanAll();
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