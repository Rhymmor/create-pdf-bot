import Stage = require('telegraf/stage');
import { Store } from './store';
import { SizeScene } from './scenes/sizeScene';
import { PdfSize } from '../lib/pdf';

export enum Scenes {
    PdfSize = 'pdf-size',
    Images = 'images'
}

export class OptionsStage {
    private stage: Stage;
    private store: Store;

    constructor(store: Store) {
        this.store = store;

        const sizeScene = new SizeScene(this.setPdfSize);
        this.stage = new Stage([
            sizeScene.getScene()
        ]);
    }

    private setPdfSize = (id: string, size: PdfSize) => {
        this.store.getUser(id).size = size;
    }

    public getMiddleware = () => {
        return this.stage.middleware();
    }
}