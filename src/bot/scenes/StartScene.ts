import { CommonScene } from "./commonScene";
import { Scenes } from "../stage";
import Markup = require('telegraf/markup');

export enum StartButtons {
    Start = 'Start'
}

const buttons = Object.keys(StartButtons) as StartButtons[];

export class StartScene extends CommonScene<StartButtons> {
    private text?: string;

    constructor(sceneType?: Scenes, text?: string) {
        super(sceneType || Scenes.Start, buttons);
        this.text = text;
    }

    protected onEnter(ctx: any) {
        return ctx.reply(
            this.text || `Click '${StartButtons.Start}' to begin pdf creating`,
            Markup
                .keyboard([buttons])
                .oneTime()
                .resize()
                .extra()
        );
    }

    protected onClick() {
        return (ctx: any) => {
            return ctx.scene.enter(Scenes.PdfSize);
        }
    }
}