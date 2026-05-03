import { prisma } from '../../lib/prisma.js';

export const projectConfigRepository = {
  async upsert(projectId: string, data: { modules: any[] }) {
    return prisma.projectConfig.upsert({
      where: { projectId },
      update: { modules: data.modules },
      create: {
        projectId,
        modules: data.modules,
      },
    });
  },

  async findByProjectId(projectId: string) {
    return prisma.projectConfig.findUnique({ where: { projectId } });
  },
};