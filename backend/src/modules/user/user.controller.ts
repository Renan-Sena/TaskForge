import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import type { AuthRequest } from '../../middleware/auth.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(successResponse(result, 'Usuário criado com sucesso'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await userService.login(req.body);
      res.json(successResponse(result, 'Login realizado com sucesso'));
    } catch (error: any) {
      res.status(401).json(errorResponse(error.message));
    }
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json(errorResponse('Refresh token não fornecido'));
      return;
    }
    try {
      const result = await userService.refreshToken(refreshToken);
      res.json(successResponse(result, 'Token renovado'));
    } catch (error: any) {
      res.status(403).json(errorResponse(error.message));
    }
  },

  async logout(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    await userService.logout(req.user.id);
    res.json(successResponse(null, 'Logout realizado'));
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    // Buscar dados atualizados do banco
    const user = await userService.getUserById(req.user.id);
    res.json(successResponse(user));
  },
};