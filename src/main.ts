import { CreatePdfBot } from "./bot";

const token_env = 'BOT_TOKEN';
const token = process.env[token_env];

if (!token) {
    throw `Please, initialize ${token_env} environment variable`;
}

const bot = new CreatePdfBot(token);
try {
    bot.start();
} catch (e) {
    console.error(e);
}