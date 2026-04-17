import { Router } from 'express';
import { taskController } from './task.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { z } from 'zod/v3';

const router = Router();

// Schemas PLANOS (sem aninhamento)
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

const moveTaskSchema = z.object({
  status: z.enum(['todo', 'doing', 'done']),
});

const commentSchema = z.object({
  content: z.string().min(1),
});

router.post('/', authenticateToken, validate(createTaskSchema), taskController.create);
router.get('/:id', authenticateToken, taskController.getById);
router.put('/:id', authenticateToken, validate(updateTaskSchema), taskController.update);
router.patch('/:id/move', authenticateToken, validate(moveTaskSchema), taskController.move);
router.delete('/:id', authenticateToken, taskController.delete);
router.post('/:id/comments', authenticateToken, validate(commentSchema), taskController.addComment);
router.get('/:id/comments', authenticateToken, taskController.getComments);

export default router;