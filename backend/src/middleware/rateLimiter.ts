import rateLimit from 'express-rate-limit';

/**
 * @param windowMs 
 * @param max 
 * @param message 
 */
export const createRateLimiter = (
  windowMs: number = 60 * 1000,
  max: number = 100,
  message: string = 'Too many requests. Please try again later.'
) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: 'Too many requests', details: message },
    skip: () => process.env.NODE_ENV === 'homolog' || process.env.NODE_ENV === 'development',
  });

export const strictAuthLimiter = createRateLimiter(
  60 * 1000,
  5,
  'Too many authentication attempts. Please wait 1 minute.'
);

export const moderateApiLimiter = createRateLimiter(
  60 * 1000,
  100,
  'Request limit exceeded. Please try again.'
);