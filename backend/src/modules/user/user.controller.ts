import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getAuthenticatedUser } from '../../utils/auth.js';

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const result = await userService.register(req.body);
      return res.status(201).json(successResponse(result, 'Usuário criado com sucesso'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async login(req: Request, res: Response) {
    try {
      const metadata = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };
      const result = await userService.login(req.body, metadata);
      return res.json(successResponse(result, 'Login realizado com sucesso'));
    } catch (error: any) {
      return res.status(401).json(errorResponse(error.message));
    }
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(errorResponse('Refresh token não fornecido'));
    }
    try {
      const metadata = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };
      const result = await userService.refreshToken(refreshToken, metadata);
      return res.json(successResponse(result, 'Token renovado com sucesso'));
    } catch (error: any) {
      return res.status(403).json(errorResponse(error.message));
    }
  },

  async logout(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const metadata = {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      email: user.email,
    };
    await userService.logout(user.id, metadata);
    return res.json(successResponse(null, 'Logout realizado com sucesso'));
  },

  async me(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const fullUser = await userService.getUserById(user.id);
    return res.json(successResponse(fullUser));
  },
};