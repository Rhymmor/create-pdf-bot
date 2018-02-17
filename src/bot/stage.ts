import Stage = require('telegraf/stage');
import { Store } from './store';
import { SizeScene } from './scenes/sizeScene';
import { PdfSize } from '../lib/pdf';
import { ImageScene } from './scenes/imageScene';
import { CreatePdfScene } from './scenes/CreatePdfScene';

export enum Scenes {
    PdfSize = 'pdf-size',
    Images = 'images',
    CreatePdf = 'create-pdf',
}

export class OptionsStage {
    private stage: Stage;
    private store: Store;

    constructor(store: Store, telegramApi: any, dirsWatcher: TmpDirsWatcher) {
        this.store = store;

        const sizeScene = new SizeScene(this.setPdfSize);
        const imageScene = new ImageScene(telegramApi, dirsWatcher, this.addMedia);
        const createPdfScene = new CreatePdfScene(dirsWatcher, store);
        this.stage = new Stage([
            sizeScene.getScene()
            imageScene.getScene(),
            createPdfScene.getScene()
        ]);
    }

    private addMedia = (id: string, img: Promise<ImageEntity>) => {
        this.store.getUser(id).media.push(img);
    }
    private setPdfSize = (id: string, size: PdfSize) => {
        this.store.getUser(id).size = size;
    }

    public getMiddleware = () => {
        return this.stage.middleware();
    }
}