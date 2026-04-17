import type { Request, Response } from 'express';
import { projectService } from './project.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getAuthenticatedUser } from '../../utils/auth.js';

export const projectController = {
  async create(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    try {
      const project = await projectService.create(user.id, req.body);
      return res.status(201).json(successResponse(project, 'Projeto criado com sucesso'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async getAll(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    try {
      const projects = await projectService.getAllByUser(user.id);
      return res.json(successResponse(projects));
    } catch (error: any) {
      return res.status(500).json(errorResponse(error.message));
    }
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('ID inválido'));
    }
    try {
      const user = getAuthenticatedUser(req);
      const project = await projectService.getById(id, user.id);
      return res.json(successResponse(project));
    } catch (error: any) {
      return res.status(404).json(errorResponse(error.message));
    }
  },

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('ID inválido'));
    }
    try {
      const user = getAuthenticatedUser(req);
      const project = await projectService.update(id, user.id, req.body);
      return res.json(successResponse(project, 'Projeto atualizado'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('ID inválido'));
    }
    try {
      const user = getAuthenticatedUser(req);
      await projectService.delete(id, user.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async inviteMember(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('ID inválido'));
    }
    try {
      const user = getAuthenticatedUser(req);
      await projectService.inviteMember(id, user.id, req.body);
      return res.json(successResponse(null, 'Membro convidado com sucesso'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },
};