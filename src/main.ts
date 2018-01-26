import { CreatePdfBot } from "./bot";
import { logger } from "./logger";

const token_env = 'BOT_TOKEN';
const token = process.env[token_env];

if (!token) {
    throw `Please, initialize ${token_env} environment variable`;
}

const bot = new CreatePdfBot(token);

async function killProcess(e: any) {
    logger.warn(`process exits with '${e}'`)
    await bot.cleanup();
    logger.info('Cleanup completed');
    process.exit(1);
}

function setSignalHandlers() {
    process.on('SIGTERM', () => killProcess("SIGTERM"));
    process.on('SIGINT', () => killProcess("SIGINT"));
    process.on('uncaughtException', (e: any) => killProcess(e));
    process.on('unhandledRejection', up => { throw up });
}

try {
    setSignalHandlers();
    bot.start();
    logger.info('Started bot');
} catch (e) {
    logger.error(e);
}