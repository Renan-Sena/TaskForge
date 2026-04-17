import 'dotenv/config';  // ← ESSENCIAL: carrega variáveis do .env
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Servidor rodando em http://localhost:${env.PORT}`);
  logger.info(`📝 Ambiente: ${env.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('🛑 Encerrando servidor...');
  server.close(async () => {
    logger.info('✅ Servidor encerrado');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);