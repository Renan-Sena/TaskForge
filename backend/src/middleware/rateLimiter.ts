import rateLimit from 'express-rate-limit';

/**
 * @param windowMs 
 * @param max 
 * @param message 
 */
export const createRateLimiter = (
  windowMs: number = 60 * 1000,
  max: number = 100,
  message: string = 'Muitas requisições. Tente novamente mais tarde.'
) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: 'Muitas requisições', details: message },
    skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development',
  });

export const strictAuthLimiter = createRateLimiter(
  60 * 1000,
  5,
  'Muitas tentativas de autenticação. Aguarde 1 minuto.'
);

export const moderateApiLimiter = createRateLimiter(
  60 * 1000,
  100,
  'Limite de requisições excedido. Tente novamente.'
);