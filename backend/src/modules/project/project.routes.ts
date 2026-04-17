import { Router } from 'express';
import { projectController } from './project.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { AnyZodObject, z} from 'zod/v3';  // Add AnyZodObject to imports

const router = Router();

// Schemas agora validam apenas o req.body (não um objeto aninhado)
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin']).optional(),
});

// Rotas
router.post('/', authenticateToken, validate(createProjectSchema as AnyZodObject), projectController.create);
router.get('/', authenticateToken, projectController.getAll);
router.get('/:id', authenticateToken, projectController.getById);
router.put('/:id', authenticateToken, validate(updateProjectSchema as AnyZodObject), projectController.update);
router.delete('/:id', authenticateToken, projectController.delete);
router.post('/:id/invite', authenticateToken, validate(inviteMemberSchema as AnyZodObject), projectController.inviteMember);

export default router;