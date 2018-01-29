import { CreatePdfBot } from "./bot/bot";
import { logger } from "./logger";
import { Store } from "./bot/store";
import { OptionsStage } from "./bot/stage";

class MainProcess {
    private static TOKEN_ENV = 'BOT_TOKEN';
    private bot: CreatePdfBot;

    start = () => {
        this.setStopSignalHandlers();
        const token = process.env[MainProcess.TOKEN_ENV];
        if (!token) {
            throw `Please, initialize ${MainProcess.TOKEN_ENV} environment variable`;
        }

        const store = new Store();
        const stage = new OptionsStage(store);
        this.bot = new CreatePdfBot(token, store, stage);
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