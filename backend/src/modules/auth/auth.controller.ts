import type { Request, Response } from 'express';
import { container } from '../../shared/container.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getAuthenticatedUser } from '../../utils/auth.js';

const authService = container.authService;
const twoFactorService = container.twoFactorService;

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

  async generate2FASecret(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    try {
      const { qrCodeDataURL, otpauthUrl } = await twoFactorService.generateSecret(user.id, user.email);
      return res.json(successResponse({ qrCodeDataURL, otpauthUrl }, 'QR Code generated successfully'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async enable2FA(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const { token } = req.body;
    try {
      const result = await twoFactorService.verifyAndEnable(user.id, token);
      if (result.enabled) {
        await container.auditService.log({
          userId: user.id,
          email: user.email,
          action: '2FA_ENABLED',
          ip: req.ip || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
        });
        return res.json(successResponse(
          { backupCodes: result.backupCodes },
          '2FA successfully activated. Keep the backup codes in a safe place.'
        ));
      } else {
        return res.status(400).json(errorResponse('Token inválido'));
      }
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },


  async disable2FA(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const { password } = req.body;
    try {
      await twoFactorService.disableWithPassword(user.id, password);

      await container.auditService.log({
        userId: user.id,
        email: user.email,
        action: '2FA_DISABLED',
        ip: req.ip || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      return res.json(successResponse(null, '2FA disabled successfully'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async verify2FA(req: Request, res: Response) {
    const { tempToken, token } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    try {
      const result = await authService.verify2FA(tempToken, token, ip);
      return res.json(successResponse(result, 'Authentication completed'));
    } catch (error: any) {
      return res.status(401).json(errorResponse(error.message));
    }
  },

  async regenerateBackupCodes(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const { password } = req.body;
    try {
      const backupCodes = await container.twoFactorService.regenerateBackupCodesWithPassword(user.id, password);
      await container.auditService.log({
        userId: user.id,
        email: user.email,
        action: '2FA_BACKUP_CODES_REGENERATED',
        ip: req.ip || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });
      return res.json(successResponse({ backupCodes }, 'New backup codes generated.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  }
};