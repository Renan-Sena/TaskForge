// src/modules/task/task.repository.ts
import { prisma } from '../../lib/prisma.js';
import { CommentCreateInput, TaskCreateInput, TaskUpdateInput } from './task.types.js';

export const taskRepository = {
  async create(data: TaskCreateInput & { createdById: string }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        projectId: data.projectId,
        createdById: data.createdById,
        assignedToId: data.assignedToId,
      },
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

  async findByProject(projectId: string, opts?: { skip?: number; limit?: number }) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: opts?.skip,
      take: opts?.limit,
    });
  },

  async countByProject(projectId: string): Promise<number> {
    return prisma.task.count({
      where: { projectId },
    });
  },

  async update(id: string, data: TaskUpdateInput) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;

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