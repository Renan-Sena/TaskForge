import type { Request, Response } from 'express';
import { projectService } from './project.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getAuthenticatedUser } from '../../utils/auth.js';
import { projectPageService } from './projectPage.service.js';
import { projectColumnService } from './projectColumn.service.js';
import { calendarService } from './calendar.service.js';
import { dashboardService } from './dashboard.service.js';

export const projectController = {

  async getDashboard(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    try {
      const dashboard = await dashboardService.getDashboard(user.id, projectId);
      return res.json(successResponse(dashboard));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

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

  async getColumns(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    try {
      const columns = await projectColumnService.getColumns(user.id, projectId);
      return res.json(successResponse(columns));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async updateColumns(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    try {
      const columns = await projectColumnService.updateColumns(user.id, projectId, req.body.columns);
      return res.json(successResponse(columns, 'Columns updated successfully.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async getCalendar(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    const { start, end } = req.query as { start?: string; end?: string };
    if (!start || !end) {
      return res.status(400).json(errorResponse('start and end query parameters are required (ISO dates).'));
    }
    try {
      const data = await calendarService.getEvents(user.id, projectId, start, end);
      return res.json(successResponse(data));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async createCalendarEvent(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const projectId = req.params.id as string;
    try {
      const event = await calendarService.createEvent(user.id, projectId, req.body);
      return res.status(201).json(successResponse(event, 'Event created.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async updateCalendarEvent(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const eventId = req.params.eventId as string;
    try {
      const event = await calendarService.updateEvent(user.id, eventId, req.body);
      return res.json(successResponse(event, 'Event updated.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async deleteCalendarEvent(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const eventId = req.params.eventId as string;
    try {
      await calendarService.deleteEvent(user.id, eventId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },
};