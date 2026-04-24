import 'dotenv/config';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📝 environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('🛑 Closing server...');
  server.close(async () => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);