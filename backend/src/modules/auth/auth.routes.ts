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

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', authenticateToken, userController.me);

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

export default router;