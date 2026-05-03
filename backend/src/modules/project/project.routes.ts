import { Router } from 'express';
import { projectController } from './project.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { z } from 'zod/v3';

const router = Router();

const suggestSchema = z.object({
  focus: z.array(z.string()).min(1),
});

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  focus: z.array(z.string()).optional(),
  modules: z.array(z.any()).optional(),
  tasks: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.string().optional(),
    suggestedDueDate: z.string().optional(),
  })).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin']).optional(),
});

router.post('/suggest', authenticateToken, validate(suggestSchema), projectController.suggestConfig);
router.post('/', authenticateToken, validate(createProjectSchema), projectController.create);
router.get('/', authenticateToken, projectController.getAll);
router.get('/:id', authenticateToken, projectController.getById);
router.put('/:id', authenticateToken, validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticateToken, projectController.delete);
router.post('/:id/invite', authenticateToken, validate(inviteMemberSchema), projectController.inviteMember);

export default router;