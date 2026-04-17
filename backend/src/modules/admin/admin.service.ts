import { adminRepository } from './admin.repository.js';
import type { SystemStats, UserAdminResponse, ProjectAdminResponse } from './admin.types.js';

export const adminService = {
  async getStats(): Promise<SystemStats> {
    return adminRepository.getStats();
  },

  async getAllUsers(): Promise<UserAdminResponse[]> {
    const users = await adminRepository.getAllUsers();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.created_at,
      ownedProjects: user.ownedProjects,
      memberProjects: user.memberProjects,
      createdTasks: user.createdTasks,
      lastActivity: null,
    }));
  },

  async getAllProjects(): Promise<ProjectAdminResponse[]> {
    const projects = await adminRepository.getAllProjects();
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      ownerName: project.owner.name,
      ownerEmail: project.owner.email, 
      membersCount: project.membersCount,
      tasksCount: project.tasksCount,
      completedTasks: project.completedTasks,
      overdueTasks: project.overdueTasks,
      createdAt: project.created_at,
    }));
  },
};