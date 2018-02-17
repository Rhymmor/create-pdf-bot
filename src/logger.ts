import * as bunyan from 'bunyan';

const logLevel = process.env.PDF_BOT_LOG_LEVEL as bunyan.LogLevelString || 'trace';

export const logger = bunyan.createLogger({name: 'create-pdf-bot', level: logLevel});