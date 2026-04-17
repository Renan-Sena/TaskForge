import type { Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { taskService } from './task.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const taskController = {
  async create(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    try {
      const task = await taskService.create(req.user.id, req.body);
      res.status(201).json(successResponse(task, 'Tarefa criada'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async getById(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json(errorResponse('ID inválido'));
      return;
    }
    try {
      const task = await taskService.getById(id, req.user.id);
      res.json(successResponse(task));
    } catch (error: any) {
      res.status(404).json(errorResponse(error.message));
    }
  },

  async update(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json(errorResponse('ID inválido'));
      return;
    }
    try {
      const task = await taskService.update(id, req.user.id, req.body);
      res.json(successResponse(task, 'Tarefa atualizada'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async move(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!id || typeof id !== 'string') {
      res.status(400).json(errorResponse('ID inválido'));
      return;
    }
    if (!status || !['todo', 'doing', 'done'].includes(status)) {
      res.status(400).json(errorResponse('Status inválido'));
      return;
    }
    try {
      const task = await taskService.move(id, req.user.id, status);
      res.json(successResponse(task, 'Tarefa movida'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async delete(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json(errorResponse('ID inválido'));
      return;
    }
    try {
      await taskService.delete(id, req.user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async addComment(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json(errorResponse('ID inválido'));
      return;
    }
    try {
      const comment = await taskService.addComment(id, req.user.id, req.body);
      res.status(201).json(successResponse(comment, 'Comentário adicionado'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async getComments(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json(errorResponse('ID inválido'));
      return;
    }
    try {
      const comments = await taskService.getComments(id, req.user.id);
      res.json(successResponse(comments));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },
};