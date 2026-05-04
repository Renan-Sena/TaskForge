import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { notificationController } from './notification.controller.js';

const router = Router();

router.get('/', authenticateToken, notificationController.list);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.patch('/read-all', authenticateToken, notificationController.markAllAsRead);

export default router;