import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }

    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.warn({ err, token }, 'Token inválido');
            res.status(403).json({ error: 'Token inválido' });
            return;
        }
        req.user = decoded as { id: string; email: string; name: string; };
        next();
    });
};