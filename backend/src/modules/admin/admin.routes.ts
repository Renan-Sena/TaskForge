import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { isSuperAdmin } from '../../middleware/isSuperAdmin.js';

const router = Router();

// Todas as rotas de admin exigem super admin
router.use(authenticateToken);
router.use(isSuperAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/projects', adminController.getAllProjects);

export default router;