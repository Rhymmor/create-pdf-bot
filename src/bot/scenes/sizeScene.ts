import Markup = require('telegraf/markup');
import Scene = require('telegraf/scenes/base');
import { Scenes } from '../stage';
import { PdfSize } from '../../lib/pdf';
import { CommonScene } from './commonScene';

const sizeList = Object.keys(PdfSize) as PdfSize[];

type SetSizeFunc = (id: string, size: PdfSize) => void;

export class SizeScene extends CommonScene<PdfSize> {
    private setSize: SetSizeFunc;

    constructor(setSize: SetSizeFunc) {
        super(Scenes.PdfSize, sizeList);
        this.setSize = setSize;
    }

    protected onEnter(ctx: any) {
        return ctx.reply(
            "Ok! Please, choose your pdf size. If your not sure just click 'Auto' size",
            Markup
                .keyboard([sizeList])
                .oneTime()
                .resize()
                .extra()
        );
    }

    protected onClick(size: PdfSize)  {
        return (ctx: any) => {
            this.setSize(this.getUserId(ctx), size);
            return ctx.reply(size);
            // return ctx.scene.enter(Scenes.Images);
        }
    }

    public getScene(): Scene {
        return this.scene;
    }
}