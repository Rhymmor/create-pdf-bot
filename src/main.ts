import { CreatePdfBot } from "./bot";
import { logger } from "./logger";

process.on('unhandledRejection', up => { throw up });

const token_env = 'BOT_TOKEN';
const token = process.env[token_env];

if (!token) {
    throw `Please, initialize ${token_env} environment variable`;
}

const bot = new CreatePdfBot(token);
try {
    bot.start();
    logger.info('Started bot');
} catch (e) {
    logger.error(e);
}