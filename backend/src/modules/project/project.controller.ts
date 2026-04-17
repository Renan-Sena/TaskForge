import type { Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { projectService } from './project.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const projectController = {
  async create(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    try {
      const project = await projectService.create(req.user.id, req.body);
      res.status(201).json(successResponse(project, 'Projeto criado com sucesso'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401).json(errorResponse('Não autenticado'));
      return;
    }
    try {
      const projects = await projectService.getAllByUser(req.user.id);
      res.json(successResponse(projects));
    } catch (error: any) {
      res.status(500).json(errorResponse(error.message));
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
      const project = await projectService.getById(id, req.user.id);
      res.json(successResponse(project));
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
      const project = await projectService.update(id, req.user.id, req.body);
      res.json(successResponse(project, 'Projeto atualizado'));
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
      await projectService.delete(id, req.user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },

  async inviteMember(req: AuthRequest, res: Response) {
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
      await projectService.inviteMember(id, req.user.id, req.body);
      res.json(successResponse(null, 'Membro convidado com sucesso'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message));
    }
  },
};