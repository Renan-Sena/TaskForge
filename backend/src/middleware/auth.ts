import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // 1. Header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7).replace(/\s+/g, '');
  }

  // 2. Header X-Access-Token
  if (!token && req.headers['x-access-token']) {
    token = (req.headers['x-access-token'] as string).replace(/\s+/g, '');
  }

  // 3. Query string ?token=...
  if (!token && req.query.token) {
    token = (req.query.token as string).replace(/\s+/g, '');
  }

  // 4. Corpo da requisição (campo access_token)
  if (!token && req.body?.access_token) {
    token = (req.body.access_token as string).replace(/\s+/g, '');
  }

  if (!token) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    res.status(403).json({ message: 'Token inválido ou expirado' });
    return;
  }

  req.user = decoded;
  next();
};