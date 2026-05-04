// src/modules/task/task.service.ts
import { taskRepository } from './task.repository.js';
import { projectRepository } from '../project/project.repository.js';
import { notificationService } from '../notification/notification.service.js';
import type {
  TaskCreateInput,
  TaskUpdateInput,
  TaskResponse,
  CommentCreateInput,
  CommentResponse,
} from './task.types.js';

export const taskService = {
  async create(userId: string, input: TaskCreateInput): Promise<TaskResponse> {
    const isMember = await projectRepository.findMember(input.projectId, userId);
    if (!isMember) throw new Error('You are not a member of this project');

    // Validação: dueDate não pode estar no passado
    if (input.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(input.dueDate) < today) {
        throw new Error('Due date cannot be in the past');
      }
    }

    const task = await taskRepository.create({ ...input, createdById: userId });

    if (input.assignedToId && input.assignedToId !== userId) {
      await notificationService.notify({
        type: 'task_assigned',
        title: 'New task assigned to you',
        message: `You have been assigned to "${task.title}".`,
        userId: input.assignedToId,
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    return formatTaskResponse(task);
  },

  async getById(taskId: string, userId: string): Promise<TaskResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Permission denied');
    return formatTaskResponse(task);
  },

  async update(taskId: string, userId: string, input: TaskUpdateInput): Promise<TaskResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Permission denied');

    // Validação: dueDate não pode estar no passado
    if (input.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(input.dueDate) < today) {
        throw new Error('Due date cannot be in the past');
      }
    }

    const previousAssignee = task.assignedToId;

    await taskRepository.update(taskId, input);
    const full = await taskRepository.findById(taskId);
    if (!full) throw new Error('Task not found after update');

    if (
      input.assignedToId &&
      input.assignedToId !== previousAssignee &&
      input.assignedToId !== userId
    ) {
      await notificationService.notify({
        type: 'task_assigned',
        title: 'New task assigned to you',
        message: `You have been assigned to "${full.title}".`,
        userId: input.assignedToId,
        taskId: taskId,
        projectId: full.projectId,
      });
    }

    return formatTaskResponse(full);
  },

  async move(taskId: string, userId: string, status: string): Promise<TaskResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Permission denied');

    await taskRepository.update(taskId, { status } as TaskUpdateInput);
    const full = await taskRepository.findById(taskId);
    if (!full) throw new Error('Task not found after move');
    return formatTaskResponse(full);
  },

  async delete(taskId: string, userId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Permission denied');

    await taskRepository.delete(taskId);
  },

  async addComment(taskId: string, userId: string, input: CommentCreateInput): Promise<CommentResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Permission denied');

    const comment = await taskRepository.createComment({ ...input, taskId, userId });

    const recipients = new Set<string>();
    if (task.createdById && task.createdById !== userId) recipients.add(task.createdById);
    if (task.assignedToId && task.assignedToId !== userId) recipients.add(task.assignedToId);

    for (const recipientId of recipients) {
      await notificationService.notify({
        type: 'comment_added',
        title: 'New comment on task',
        message: `A new comment was added to "${task.title}".`,
        userId: recipientId,
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    return formatCommentResponse(comment);
  },

  async getComments(taskId: string, userId: string): Promise<CommentResponse[]> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Permission denied');

    const comments = await taskRepository.findCommentsByTask(taskId);
    return comments.map(formatCommentResponse);
  },

  // ---------- PAGINAÇÃO ----------
  async findByProject(projectId: string, userId: string, opts?: { skip?: number; limit?: number }) {
    const isMember = await projectRepository.findMember(projectId, userId);
    if (!isMember) throw new Error('Permission denied');
    const tasks = await taskRepository.findByProject(projectId, opts);
    return tasks.map(formatTaskResponse);
  },

  async countByProject(projectId: string, userId: string): Promise<number> {
    const isMember = await projectRepository.findMember(projectId, userId);
    if (!isMember) throw new Error('Permission denied');
    return taskRepository.countByProject(projectId);
  },
};

function formatTaskResponse(task: any): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    projectId: task.projectId,
    createdById: task.createdById,
    assignedToId: task.assignedToId,
    createdAt: task.createdAt ?? task.created_at,
    updatedAt: task.updatedAt ?? task.updated_at,
    createdBy: task.createdBy,
    assignedTo: task.assignedTo,
    comments: task.comments?.map(formatCommentResponse),
  };
}

function formatCommentResponse(comment: any): CommentResponse {
  return {
    id: comment.id,
    content: comment.content,
    userId: comment.userId,
    taskId: comment.taskId,
    createdAt: comment.createdAt ?? comment.created_at,
    user: comment.user,
  };
}