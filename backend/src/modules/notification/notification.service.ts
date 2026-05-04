import { notificationRepository } from './notification.repository.js';

export const notificationService = {
  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    return notificationRepository.findByUser(userId, { unreadOnly });
  },

  async markAsRead(notificationId: string, userId: string) {
    await notificationRepository.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  },

  async notify(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    taskId?: string;
    projectId?: string;
  }) {
    await notificationRepository.create(data);
  },
};