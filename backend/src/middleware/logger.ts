import { pinoHttp } from 'pino-http';
import { logger } from '../config/logger.js';

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});