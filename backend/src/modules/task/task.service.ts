import { taskRepository } from './task.repository.js';
import { projectRepository } from '../project/project.repository.js';
import type { TaskCreateInput, TaskUpdateInput, TaskResponse, CommentCreateInput, CommentResponse } from './task.types.js';

export const taskService = {
  async create(userId: string, input: TaskCreateInput): Promise<TaskResponse> {
    const isMember = await projectRepository.findMember(input.projectId, userId);
    if (!isMember) throw new Error('Você não é membro deste projeto');

    const task = await taskRepository.create({ ...input, createdById: userId });
    return formatTaskResponse(task);
  },

  async getById(taskId: string, userId: string): Promise<TaskResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Tarefa não encontrada');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Sem permissão para ver esta tarefa');
    return formatTaskResponse(task);
  },

  async update(taskId: string, userId: string, input: TaskUpdateInput): Promise<TaskResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Tarefa não encontrada');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Sem permissão para editar esta tarefa');

    const updated = await taskRepository.update(taskId, input);
    const full = await taskRepository.findById(taskId);
    return formatTaskResponse(full!);
  },

  async move(taskId: string, userId: string, status: 'todo' | 'doing' | 'done'): Promise<TaskResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Tarefa não encontrada');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Sem permissão para mover esta tarefa');

    const updated = await taskRepository.update(taskId, { status });
    const full = await taskRepository.findById(taskId);
    return formatTaskResponse(full!);
  },

  async delete(taskId: string, userId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Tarefa não encontrada');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Sem permissão para deletar esta tarefa');

    await taskRepository.delete(taskId);
  },

  async addComment(taskId: string, userId: string, input: CommentCreateInput): Promise<CommentResponse> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Tarefa não encontrada');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Sem permissão para comentar');

    const comment = await taskRepository.createComment({ ...input, taskId, userId });
    return formatCommentResponse(comment);
  },

  async getComments(taskId: string, userId: string): Promise<CommentResponse[]> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new Error('Tarefa não encontrada');
    const isMember = await projectRepository.findMember(task.projectId, userId);
    if (!isMember) throw new Error('Sem permissão para ver comentários');

    const comments = await taskRepository.findCommentsByTask(taskId);
    return comments.map(formatCommentResponse);
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
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
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
    createdAt: comment.createdAt,
    user: comment.user,
  };
}