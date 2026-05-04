import type { Request, Response } from 'express';
import { getAuthenticatedUser } from '../../utils/auth.js';
import { notificationService } from './notification.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const notificationController = {
  async list(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const unreadOnly = req.query.unread === 'true';
    try {
      const notifications = await notificationService.getUserNotifications(user.id, unreadOnly);
      return res.json(successResponse(notifications));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async markAsRead(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json(errorResponse('Notification ID required'));
    }
    try {
      await notificationService.markAsRead(id, user.id);
      return res.json(successResponse(null, 'Notification marked as read.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    try {
      await notificationService.markAllAsRead(user.id);
      return res.json(successResponse(null, 'All notifications marked as read.'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message));
    }
  },
};