import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { Prisma } from '../generated/prisma/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {  // ← adicione : void
  logger.error({ err, req }, 'Unhandled error');

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Conflito: recurso já existe' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Recurso não encontrado' });
      return;
    }
  }

  const status = (err as any).status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};