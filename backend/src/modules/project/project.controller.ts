import type { Request, Response } from 'express';
import { projectService } from './project.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getAuthenticatedUser } from '../../utils/auth.js';
import { projectPageService } from './projectPage.service.js';

export const projectController = {
  async suggestConfig(req: Request, res: Response) {
    const { focus } = req.body;
    if (!focus || !Array.isArray(focus) || focus.length === 0) {
      return res.status(400).json(errorResponse('A list of focus keys is required.'));
    }
    try {
      const config = await projectService.suggestConfig(focus);
      return res.json(successResponse(config, 'Configuration suggested successfully.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async create(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    try {
      const project = await projectService.create(user.id, req.body);
      return res.status(201).json(successResponse(project, 'Project created successfully.'));
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

  async listPages(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    try {
      const pages = await projectPageService.listPages(user.id, projectId);
      return res.json(successResponse(pages));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async createPage(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    try {
      const page = await projectPageService.createPage(user.id, projectId, req.body);
      return res.status(201).json(successResponse(page, 'Page created successfully.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async updatePage(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const pageId = req.params.pageId as string;
    try {
      const page = await projectPageService.updatePage(user.id, pageId, req.body);
      return res.json(successResponse(page, 'Page updated.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async deletePage(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const pageId = req.params.pageId as string;
    try {
      await projectPageService.deletePage(user.id, pageId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },
};