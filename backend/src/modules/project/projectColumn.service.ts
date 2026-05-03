import { projectConfigRepository } from './projectConfig.repository.js';
import { projectRepository } from './project.repository.js';

export const projectColumnService = {
  async getColumns(userId: string, projectId: string) {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Project not found or access denied');

    const config = await projectConfigRepository.findByProjectId(projectId);
    return config?.columns ?? [];
  },

  async updateColumns(userId: string, projectId: string, columns: Array<{ name: string; order: number }>) {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');

    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('Columns must be a non-empty array');
    }
    const names = columns.map(c => c.name);
    if (new Set(names).size !== names.length) {
      throw new Error('Column names must be unique');
    }

    await projectConfigRepository.updateColumns(projectId, columns);
    return columns;
  },
};