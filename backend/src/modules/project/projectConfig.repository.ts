import { prisma } from '../../lib/prisma.js';

export const projectConfigRepository = {
  async upsert(projectId: string, data: { modules?: any[]; columns?: any[] }) {
    const updateData: any = {};
    if (data.modules !== undefined) updateData.modules = data.modules;
    if (data.columns !== undefined) updateData.columns = data.columns;

    return prisma.projectConfig.upsert({
      where: { projectId },
      update: updateData,
      create: {
        projectId,
        modules: data.modules ?? [],
        columns: data.columns ?? [],
      },
    });
  },

  async findByProjectId(projectId: string) {
    return prisma.projectConfig.findUnique({ where: { projectId } });
  },

  async updateColumns(projectId: string, columns: any[]) {
    return prisma.projectConfig.upsert({
      where: { projectId },
      update: { columns },
      create: { projectId, modules: [], columns },
    });
  },
};