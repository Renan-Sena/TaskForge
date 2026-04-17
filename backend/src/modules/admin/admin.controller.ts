import type { Request, Response } from 'express';
import { adminService } from './admin.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const adminController = {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats();
      res.json(successResponse(stats));
    } catch (error: any) {
      res.status(500).json(errorResponse(error.message));
    }
  },

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await adminService.getAllUsers();
      res.json(successResponse(users));
    } catch (error: any) {
      res.status(500).json(errorResponse(error.message));
    }
  },

  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await adminService.getAllProjects();
      res.json(successResponse(projects));
    } catch (error: any) {
      res.status(500).json(errorResponse(error.message));
    }
  },
};