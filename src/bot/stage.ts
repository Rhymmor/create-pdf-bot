import Stage = require('telegraf/stage');
import { Store } from './store';
import { SizeScene } from './scenes/sizeScene';
import { PdfSize } from '../lib/pdf';
import { ImageScene } from './scenes/imageScene';
import { TmpDirsWatcher } from '../lib/tmpDirs';
import { ImageEntity } from '../lib/image';
import { CreatePdfScene } from './scenes/CreatePdfScene';
import { StartScene } from './scenes/StartScene';
import { StartAgainScene } from './scenes/StartAgainScene';

export enum Scenes {
    PdfSize = 'pdf-size',
    Images = 'images',
    CreatePdf = 'create-pdf',
    Start = 'start',
    StartAgain = 'start-again'
}

export class OptionsStage {
    private stage: Stage;
    private store: Store;

    constructor(store: Store, telegramApi: any, dirsWatcher: TmpDirsWatcher) {
        this.store = store;

        const scenes = [
            new StartScene(),
            new SizeScene(this.setPdfSize),
            new ImageScene(telegramApi, dirsWatcher, this.addMedia),
            new CreatePdfScene(dirsWatcher, store),
            new StartAgainScene()
        ]
        this.stage = new Stage(scenes.map(x => x.getScene()));
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