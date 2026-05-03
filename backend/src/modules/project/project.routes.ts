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

const createPageSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  order: z.number().optional(),
});

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  order: z.number().optional(),
});

const updateColumnsSchema = z.object({
  columns: z.array(z.object({
    name: z.string().min(1),
    order: z.number().int().min(0),
  })).min(1),
});

router.post('/suggest', authenticateToken, validate(suggestSchema), projectController.suggestConfig);
router.post('/', authenticateToken, validate(createProjectSchema), projectController.create);
router.get('/', authenticateToken, projectController.getAll);
router.get('/:id', authenticateToken, projectController.getById);
router.put('/:id', authenticateToken, validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticateToken, projectController.delete);
router.post('/:id/invite', authenticateToken, validate(inviteMemberSchema), projectController.inviteMember);

router.get('/:id/pages', authenticateToken, projectController.listPages);
router.post('/:id/pages', authenticateToken, validate(createPageSchema), projectController.createPage);
router.put('/:id/pages/:pageId', authenticateToken, validate(updatePageSchema), projectController.updatePage);
router.delete('/:id/pages/:pageId', authenticateToken, projectController.deletePage);
router.get('/:id/columns', authenticateToken, projectController.getColumns);
router.put('/:id/columns', authenticateToken, validate(updateColumnsSchema), projectController.updateColumns);

export default router;