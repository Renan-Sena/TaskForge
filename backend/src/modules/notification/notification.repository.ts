import { prisma } from '../../lib/prisma.js';

export const notificationRepository = {
  async findByUser(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { created_at: 'desc' },
      take: options?.limit ?? 50,
    });
  },

  async create(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    taskId?: string;
    projectId?: string;
  }) {
    return prisma.notification.create({ data });
  },

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};