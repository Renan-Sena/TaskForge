import { projectPageRepository } from './projectPage.repository.js';
import { projectRepository } from './project.repository.js';

export const projectPageService = {
  async listPages(userId: string, projectId: string) {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Project not found or access denied');
    return projectPageRepository.findByProjectId(projectId);
  },

  async getPage(userId: string, pageId: string) {
    const page = await projectPageRepository.findById(pageId);
    if (!page) throw new Error('Page not found');
    const project = await projectRepository.findById(page.projectId, userId);
    if (!project) throw new Error('Access denied');
    return page;
  },

  async createPage(userId: string, projectId: string, data: { title: string; content?: string; order?: number }) {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');

    return projectPageRepository.create({
      projectId,
      title: data.title,
      content: data.content,
      order: data.order,
    });
  },

  async updatePage(userId: string, pageId: string, data: { title?: string; content?: string; order?: number }) {
    const page = await projectPageRepository.findById(pageId);
    if (!page) throw new Error('Page not found');
    const isAdmin = await projectRepository.isAdmin(page.projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');
    return projectPageRepository.update(pageId, data);
  },

  async deletePage(userId: string, pageId: string) {
    const page = await projectPageRepository.findById(pageId);
    if (!page) throw new Error('Page not found');
    const isAdmin = await projectRepository.isAdmin(page.projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');
    await projectPageRepository.delete(pageId);
  },
};