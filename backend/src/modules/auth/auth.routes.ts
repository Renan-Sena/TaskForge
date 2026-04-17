import { Router } from 'express';
import { authController } from './auth.controller.js';

const router = Router();

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

export default router;