import { Request, Response } from 'express';
import passport from '../../lib/passaport.js';
import { authService } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const authController = {
  googleAuth: passport.authenticate('google', { scope: ['profile', 'email'] }),

  googleCallback: (req: Request, res: Response) => {
    passport.authenticate('google', { session: false }, async (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }
      const { accessToken, refreshToken } = await authService.handleOAuthLogin(user, req.ip || '');
      // Redireciona para o frontend com tokens (exemplo via query string ou cookie)
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    })(req, res);
  },
};