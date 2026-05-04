import { projectRepository } from './project.repository.js';
import { projectTemplateRepository } from './projectTemplate.repository.js';
import { container } from '../../shared/container.js';
import { userRepository } from '../user/user.repository.js';
import type { ProjectCreateInput, ProjectUpdateInput, ProjectResponse, ProjectMemberInput } from './project.types.js';
import { notificationService } from '../notification/notification.service.js';

export const projectService = {
  async suggestConfig(focusList: string[]) {
    const modulesMap = new Map<string, any>();
    let allTasks: any[] = [];

    for (const focusKey of focusList) {
      const tmpl = await projectTemplateRepository.findByFocus(focusKey);
      if (!tmpl) continue;

      tmpl.modules.forEach((mod: any) => {
        if (!modulesMap.has(mod.id)) {
          modulesMap.set(mod.id, mod);
        }
      });

      if (tmpl.tasks) {
        allTasks.push(...tmpl.tasks);
      }
    }

    let currentDate = new Date();
    const tasksWithDeadlines = allTasks.map((task: any) => {
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + (task.estimatedDays || 3));
      currentDate = dueDate;
      return {
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        estimatedDays: task.estimatedDays || 3,
        suggestedDueDate: dueDate.toISOString().split('T')[0],
      };
    });

    return {
      modules: Array.from(modulesMap.values()),
      tasks: tasksWithDeadlines,
    };
  },

  async create(userId: string, input: ProjectCreateInput & { focus?: string[]; modules?: any[]; tasks?: any[] }): Promise<ProjectResponse> {
    const project = await projectRepository.create({
      name: input.name,
      description: input.description,
      ownerId: userId,
      focus: input.focus ?? [],
    });

    if (input.modules && input.modules.length > 0) {
      await projectRepository.upsertConfig(project.id, input.modules);
    }

    if (input.tasks && input.tasks.length > 0) {
      for (const taskData of input.tasks) {
        await container.taskService.create(userId, {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          dueDate: taskData.suggestedDueDate ? new Date(taskData.suggestedDueDate) : undefined,
          projectId: project.id,
        });
      }
    }

    const fullProject = await projectRepository.findById(project.id, userId);
    return formatProjectResponse(fullProject);
  },

  async getById(projectId: string, userId: string): Promise<ProjectResponse> {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Project not found or access denied');
    return formatProjectResponse(project);
  },

  async getAllByUser(userId: string): Promise<ProjectResponse[]> {
    const projects = await projectRepository.findByUser(userId);
    return projects.map(formatProjectResponse);
  },

  async update(projectId: string, userId: string, input: ProjectUpdateInput): Promise<ProjectResponse> {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');
    await projectRepository.update(projectId, input);
    const updated = await projectRepository.findById(projectId, userId);
    if (!updated) throw new Error('Project not found');
    return formatProjectResponse(updated);
  },

  async delete(projectId: string, userId: string): Promise<void> {
    const project = await projectRepository.findById(projectId, userId);
    if (!project || project.ownerId !== userId) {
      throw new Error('Only the owner can delete the project');
    }
    await projectRepository.delete(projectId);
  },

  async inviteMember(projectId: string, userId: string, input: ProjectMemberInput): Promise<void> {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');

    const userToInvite = await userRepository.findByEmail(input.email);
    if (!userToInvite) throw new Error('User not found');

    const existing = await projectRepository.findMember(projectId, userToInvite.id);
    if (existing) throw new Error('User is already a member');

    await projectRepository.addMember(projectId, userToInvite.id, input.role || 'member');

    const project = await projectRepository.findById(projectId, userId);
    if (project) {
      await notificationService.notify({
        type: 'invited_to_project',
        title: 'You have been invited to a project',
        message: `You are now a member of "${project.name}".`,
        userId: userToInvite.id,
        projectId,
      });
    }
  }
};

function formatProjectResponse(project: any): ProjectResponse {
  const tasks = project.tasks || [];
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t: any) => t.status === 'todo').length,
    doing: tasks.filter((t: any) => t.status === 'doing').length,
    done: tasks.filter((t: any) => t.status === 'done').length,
  };

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    focus: project.focus || [],
    config: project.config || null,
    ownerId: project.ownerId,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    owner: {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      avatar: project.owner.avatar,
    },
    members: project.members?.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
      },
    })) || [],
    stats,
  };
}