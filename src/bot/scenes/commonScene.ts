import Scene = require('telegraf/scenes/base');
import { Scenes } from '../stage';

export abstract class CommonScene<T extends string> {
    protected scene: Scene;

    constructor(name: Scenes, buttons?: T[]) {
        this.scene = new Scene(name);
        this.scene.enter(this.onEnter.bind(this));
        if (buttons) {
            for (const button of buttons) {
                this.scene.hears(button, this.onClick(button));
            }
        }
    }

    protected abstract onEnter(ctx: any): any;
    protected abstract onClick(arg: T): (ctx: any) => any;

    protected getUserId = (ctx: any): string => {
        return String(ctx.update.message.from.id);
    }

    public getScene(): Scene {
        return this.scene;
    }
}