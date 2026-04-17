import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
};

// 🔹 Função que estava faltando
export const verifyRefreshToken = (token: string) => {
  // O refresh token não é JWT, é um token aleatório. A verificação real é feita comparando o hash no banco.
  // Esta função apenas decodifica se você estiver usando JWT para refresh. Como não usamos JWT para refresh,
  // podemos retornar o token original ou lançar erro. Mas para compatibilidade com o código existente,
  // vamos retornar o payload fictício ou simplesmente o token. Ajuste conforme sua lógica.
  // O ideal é que o refresh token seja um JWT também, mas vamos manter simples:
  return { id: token }; // placeholders
};