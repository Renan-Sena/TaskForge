// src/modules/task/task.controller.ts
import type { Request, Response } from 'express';
import { taskService } from './task.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getAuthenticatedUser } from '../../utils/auth.js';
import { projectConfigRepository } from '../project/projectConfig.repository.js';

export const taskController = {
  async create(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    try {
      const task = await taskService.create(user.id, req.body);
      return res.status(201).json(successResponse(task, 'Task created'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('Invalid task ID'));
    }
    try {
      const user = getAuthenticatedUser(req);
      const task = await taskService.getById(id, user.id);
      return res.json(successResponse(task));
    } catch (error: any) {
      return res.status(404).json(errorResponse(error.message));
    }
  },

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('Invalid task ID'));
    }
    try {
      const user = getAuthenticatedUser(req);
      const task = await taskService.update(id, user.id, req.body);
      return res.json(successResponse(task, 'Task updated'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async move(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!id) {
      return res.status(400).json(errorResponse('Invalid task ID'));
    }

    try {
      const user = getAuthenticatedUser(req);

      const task = await taskService.getById(id, user.id);
      if (!task) throw new Error('Task not found');

      const config = await projectConfigRepository.findByProjectId(task.projectId);
      const validStatuses = (config?.columns as any[] ?? []).map(c => c.name);

      if (validStatuses.length === 0) {
        validStatuses.push('todo', 'doing', 'done');
      }

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json(errorResponse(`Invalid status. Valid: ${validStatuses.join(', ')}`));
      }

      const updatedTask = await taskService.move(id, user.id, status);
      return res.json(successResponse(updatedTask, 'Task moved'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('Invalid task ID'));
    }
    try {
      const user = getAuthenticatedUser(req);
      await taskService.delete(id, user.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async addComment(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('Invalid task ID'));
    }
    try {
      const user = getAuthenticatedUser(req);
      const comment = await taskService.addComment(id, user.id, req.body);
      return res.status(201).json(successResponse(comment, 'Comment added'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async getComments(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('Invalid task ID'));
    }
    try {
      const user = getAuthenticatedUser(req);
      const comments = await taskService.getComments(id, user.id);
      return res.json(successResponse(comments));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },
};