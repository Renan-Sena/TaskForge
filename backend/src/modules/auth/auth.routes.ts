import { Router } from 'express';
import { userController } from '../user/user.controller.js';
import { authController } from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { passwordSchema } from '../../utils/validation/password.js';
import { z } from 'zod/v3';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

const enable2FASchema = z.object({
  token: z.string().length(6, 'Token deve ter 6 dígitos'),
});

const verify2FASchema = z.object({
  tempToken: z.string(),
  token: z.string().length(6, 'Token deve ter 6 dígitos'),
});

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.post('/verify-2fa', validate(verify2FASchema), authController.verify2FA);

router.get('/me', authenticateToken, userController.me);
router.get('/2fa/generate', authenticateToken, authController.generate2FASecret);
router.post('/2fa/enable', authenticateToken, validate(enable2FASchema), authController.enable2FA);
router.post('/2fa/disable', authenticateToken, authController.disable2FA);

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

export default router;