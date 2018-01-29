const TelegramBot = require('telegraf');
const Markup = require('telegraf/markup');
const session = require('telegraf/session');
import { PdfCreator, PdfSize } from '../lib/pdf';
import { logger } from '../logger';
import { TmpDirsWatcher } from '../lib/tmpDirs';
import {generate as generateId} from 'shortid';
import * as path from 'path';
import { processImage } from '../lib/image';
import { Scenes, OptionsStage } from './stage';
import { Store } from './store';

enum FileTypes {
    Photo = 'photo',
    Document = 'document'
};

export class CreatePdfBot {
    private static CREATE_LABEL: string = '✅ Create';
    private static PDF_NAME = 'images.pdf';
    
    private bot: any;
    private store: Store;
    private pdfCreator: PdfCreator;
    private dirsWatcher: TmpDirsWatcher;

    constructor(token: string, store: Store, stage: OptionsStage) {
        this.store = store;
        this.pdfCreator = new PdfCreator(CreatePdfBot.PDF_NAME);
        this.dirsWatcher = new TmpDirsWatcher();

        this.bot = new TelegramBot(token);
        this.bot.use(session());
        this.bot.use(stage.getMiddleware());

        this.bot.on(FileTypes.Photo, this.handleFileMsg(FileTypes.Photo));
        this.bot.on(FileTypes.Document, this.handleFileMsg(FileTypes.Document));
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

    private handleFileMsg = (type: FileTypes) => async (ctx: any) => {
        if (!ctx.update.message[type]) {
            logger.error('No message info.', type, ctx.update);
            return;
        }
        const link = await this.bot.telegram.getFileLink(this.getLastFileId(ctx, type));

        const id = this.getUserId(ctx);
        const dir = this.dirsWatcher.isIdActive(id)
            ? this.dirsWatcher.getIdTmpDir(id)
            : await this.dirsWatcher.prepareIdDir(id);
        const filepath = path.join(dir, generateId());

        const promiseImage = processImage(link, filepath);
        this.store.getUser(id).media.push(promiseImage);

        return ctx.reply('a', Markup
            .keyboard([[CreatePdfBot.CREATE_LABEL]])
            .oneTime()
            .resize()
            .extra()
        );
    }

    private getLastFileId = (ctx: any, type: FileTypes): string => {
        //TODO: give an option to choose photo quality
        if (type === FileTypes.Photo) {
            return ctx.update.message[type][ctx.update.message[type].length - 1].file_id;
        }
        // Check file mime type (ctx.update.message.mime_type)
        return ctx.update.message[type].file_id;
    }

    private getUserId = (ctx: any): string => {
        return String(ctx.update.message.from.id);
    }

    private handleEndCommand = async (ctx: any) => {
        const id = this.getUserId(ctx);
        const media = this.store.getUser(id).media;
        const images = await Promise.all(media);
        const pdf = await this.pdfCreator.create(PdfSize.A4, this.dirsWatcher.getIdTmpDir(id), images);
        ctx.replyWithDocument({source: pdf, filename: CreatePdfBot.PDF_NAME});
        this.clean(id);
    }

    private handleStartCommand = (ctx: any) => {
        return ctx.scene.enter(Scenes.PdfSize);
    }

    private handleHelpCommand = (ctx: any) => {
        return ctx.reply(this.showHelp());
    }

    private clean(id: string) {
        this.store.deleteUser(id);
        this.dirsWatcher.clean(id);
    }

    public cleanup() {
        return this.dirsWatcher.cleanAll();
    }

    private showHelp() {
        return `Hello, stranger! I can help you to create pdf from images.
        To do that just send images to me, wait them to upload and then click create button.`;
    }
}