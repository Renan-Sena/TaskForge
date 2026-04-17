import type { Request, Response } from 'express';
import { container } from '../../shared/container.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const authService = container.authService;

export const authController = {
  googleAuth(req: Request, res: Response) {
    res.redirect('/auth/google/callback');
  },

  async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json(errorResponse('Falha na autenticação Google'));
      }
      const ip = req.ip || req.socket.remoteAddress || '';
      const result = await authService.handleOAuthLogin(user, ip);
      return res.json(successResponse(result, 'Login com Google realizado com sucesso'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(errorResponse('Refresh token não fornecido'));
    }
    const ip = req.ip || req.socket.remoteAddress || '';
    try {
      const tokens = await authService.refreshTokens(refreshToken, ip);
      return res.json(successResponse(tokens, 'Tokens renovados'));
    } catch (error: any) {
      return res.status(403).json(errorResponse(error.message));
    }
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    return res.json(successResponse(null, 'Logout realizado'));
  },
};