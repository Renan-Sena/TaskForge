import { prisma } from '../../lib/prisma.js';
import type { TaskCreateInput, TaskUpdateInput, CommentCreateInput } from './task.types.js';

export const taskRepository = {
  async create(data: TaskCreateInput & { createdById: string }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        projectId: data.projectId,
        createdById: data.createdById,
        assignedToId: data.assignedToId ?? null,
        priority: data.priority ?? 'medium',
        dueDate: data.dueDate ?? null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  },

  async findByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async update(id: string, data: TaskUpdateInput) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId ?? null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ?? null;

    return prisma.task.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  async createComment(data: CommentCreateInput & { taskId: string; userId: string }) {
    return prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        userId: data.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  },

  async findCommentsByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async deleteComment(id: string) {
    return prisma.comment.delete({ where: { id } });
  },
};