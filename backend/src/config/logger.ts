import pino from 'pino';
import { env } from './env.js';

const isDevelopment = env.NODE_ENV === 'development';

const loggerOptions: pino.LoggerOptions = {
  level: isDevelopment ? 'debug' : 'info',
};

if (isDevelopment) {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  };
}

export const logger = pino(loggerOptions);