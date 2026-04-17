import type { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from './auth.js';

export const isSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || user.role !== 'superadmin') {
    res.status(403).json({ error: 'Acesso negado. Apenas super administradores.' });
    return;
  }
  next();
};