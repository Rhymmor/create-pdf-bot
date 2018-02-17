import Scene = require('telegraf/scenes/base');
import { Scenes } from '../stage';
import { logger } from '../../logger';

export abstract class CommonScene<T extends string> {
    protected scene: Scene;

    constructor(name: Scenes, buttons?: T[]) {
        this.scene = new Scene(name);
        this.scene.enter(this.onEnterLogged(name));
        if (buttons) {
            for (const button of buttons) {
                this.scene.hears(button, this.onClickLogged(button));
            }
        }
    }
    
    private onClickLogged = (button: T) => {
        return (ctx: any) => {
            logger.debug(`User ${this.getUserId(ctx)} clicked '${button}' button`);
            this.onClick(button)(ctx);
        }
    }

    private onEnterLogged = (name: Scenes): any => {
        return (ctx: any) => {
            logger.debug(`User ${this.getUserId(ctx)} entered '${name}' scene`);
            this.onEnter(ctx);
        }
    }

    protected abstract onEnter(ctx: any): any;
    protected abstract onClick(button: T): (ctx: any) => any;

    protected getUserId = (ctx: any): string => {
        return String(ctx.update.message.from.id);
    }

    public getScene(): Scene {
        return this.scene;
    }
}