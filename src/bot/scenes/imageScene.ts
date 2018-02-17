import { CommonScene } from "./commonScene";
import { Scenes } from "../stage";
import Markup = require('telegraf/markup');
import { logger } from "../../logger";
import { TmpDirsWatcher } from "../../lib/tmpDirs";
import * as path from 'path';
import {generate as generateId} from 'shortid';
import { processImage, ImageEntity } from "../../lib/image";

enum FileTypes {
    Photo = 'photo',
    Document = 'document'
};

enum ImageButtons {
    Create = 'Create!'
}
const buttons = Object.keys(ImageButtons) as ImageButtons[];

type AddImage = (id: string, img: Promise<ImageEntity>) => void;

export class ImageScene extends CommonScene<ImageButtons> {
    private telegramApi: any;
    private addImage: AddImage;
    private dirsWatcher: TmpDirsWatcher;

    constructor(telegramApi: any, dirsWatcher: TmpDirsWatcher, addImage: AddImage) {
        super(Scenes.Images, buttons);

        this.telegramApi = telegramApi;
        this.dirsWatcher = dirsWatcher;
        this.addImage = addImage;
        
        this.scene.on(FileTypes.Photo, this.handleFileMsg(FileTypes.Photo));
        this.scene.on(FileTypes.Document, this.handleFileMsg(FileTypes.Document));
    }

    private handleFileMsg = (type: FileTypes) => async (ctx: any) => {
        if (!ctx.update.message[type]) {
            logger.error('No message info.', type, ctx.update);
            return;
        }
        const link = await this.telegramApi.getFileLink(this.getLastFileId(ctx, type));

        const id = this.getUserId(ctx);
        const dir = await this.prepareUserDirectory(id);
        const filepath = path.join(dir, generateId());

        const promiseImage = processImage(link, filepath);
        this.addImage(id, promiseImage);
    }

    private async prepareUserDirectory(id: string) {
        return this.dirsWatcher.isIdActive(id)
            ? this.dirsWatcher.getIdTmpDir(id)
            : await this.dirsWatcher.prepareIdDir(id);
    }

    private getLastFileId = (ctx: any, type: FileTypes): string => {
        //TODO: give an option to choose photo quality
        if (type === FileTypes.Photo) {
            return ctx.update.message[type][ctx.update.message[type].length - 1].file_id;
        }
        // Check file mime type (ctx.update.message.mime_type)
        return ctx.update.message[type].file_id;
    }

    protected onEnter(ctx: any) {
        return ctx.reply(
            "Send your images to me and then click 'Create' button and I'll make PDF for you",
            Markup
                .keyboard([buttons])
                .resize()
                .extra()
        );
    }

    protected onClick()  {
        return (ctx: any) => {
            //return ctx.reply('OK!');
            return ctx.scene.enter(Scenes.CreatePdf);
        }
    }
}