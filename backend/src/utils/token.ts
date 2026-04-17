import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const generateAccessToken = (payload: { id: string; email: string; name: string }) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: { id: string }) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  try {
    console.log('🔐 Verificando token com segredo:', env.JWT_SECRET);
    console.log('🔐 Segredo (JSON):', JSON.stringify(env.JWT_SECRET));
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as { id: string; email: string; name: string };
  } catch (err: any) {
    console.error('❌ Erro na verificação JWT:', err.message);
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};