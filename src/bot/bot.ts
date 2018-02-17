const session = require('telegraf/session');
import { logger } from '../logger';
import { TmpDirsWatcher } from '../lib/tmpDirs';
import { Scenes, OptionsStage } from './stage';

export class CreatePdfBot {    
    private bot: any;
    private dirsWatcher: TmpDirsWatcher;

    constructor(bot: any, stage: OptionsStage, dirsWatcher: TmpDirsWatcher) {
        this.dirsWatcher = dirsWatcher;

        this.bot = bot;
        this.bot.use(session());
        this.bot.use(stage.getMiddleware());

        this.bot.command('start', this.handleStartCommand);
        this.bot.command('help', this.handleHelpCommand);
    }

    public start() {
        this.bot.catch(logger.error);
        this.bot.startPolling();
    }

    private handleStartCommand = (ctx: any) => {
        return ctx.scene.enter(Scenes.Start);
    }

    private handleHelpCommand = (ctx: any) => {
        return ctx.reply(this.showHelp());
    }

    public cleanup() {
        return this.dirsWatcher.cleanAll();
    }

    private showHelp() {
        return `Hello, stranger! I can help you to create pdf from images.
        To do that just send images to me, wait them to upload and then click create button.`;
    }
}