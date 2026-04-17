// backend/src/lib/prisma.ts
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../config/env.js';

const connectionString = env.DATABASE_URL;

// Configuração SSL que funciona para Aiven em desenvolvimento
const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Essencial para certificado autoassinado
  },
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});