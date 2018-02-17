import { CreatePdfBot } from "./bot/bot";
import { logger } from "./logger";
import { Store } from "./bot/store";
import { OptionsStage } from "./bot/stage";
import { TmpDirsWatcher } from "./lib/tmpDirs";
const TelegramBot = require('telegraf');

class MainProcess {
    private static TOKEN_ENV = 'BOT_TOKEN';
    private bot: CreatePdfBot;

    start = () => {
        this.setStopSignalHandlers();
        const token = process.env[MainProcess.TOKEN_ENV];
        if (!token) {
            throw `Please, initialize ${MainProcess.TOKEN_ENV} environment variable`;
        }

        const botApi = new TelegramBot(token);
        const store = new Store();
        const dirsWatcher = new TmpDirsWatcher();
        const stage = new OptionsStage(store, botApi.telegram, dirsWatcher);
        this.bot = new CreatePdfBot(botApi, stage, dirsWatcher);
        this.bot.start();
        logger.info('Started bot');
    }

    private async killProcess(e: any) {
        logger.warn(`process exits with '${e}'`);
        if (this.bot) {
            await this.bot.cleanup();
        }
        logger.info('Cleanup completed');
        process.exit(1);
    }

    private setStopSignalHandlers() {
        process.on('SIGTERM', () => this.killProcess("SIGTERM"));
        process.on('SIGINT', () => this.killProcess("SIGINT"));
        process.on('uncaughtException', (e: any) => this.killProcess(e));
        process.on('unhandledRejection', up => { throw up });
    }
}

const main = new MainProcess();
main.start();