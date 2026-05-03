import { prisma } from '../../lib/prisma.js';
import type { IProjectTemplateRepository, TemplateData } from './interfaces/IProjectTemplateRepository.js';

export const projectTemplateRepository: IProjectTemplateRepository = {
  async findByFocus(focus: string): Promise<TemplateData | null> {
    const t = await prisma.projectTemplate.findUnique({
      where: { focus },
      select: { modules: true, columns: true, tasks: true },
    });
    if (!t) return null;
    return {
      columns: (t.columns as any) ?? undefined,
      modules: (t.modules as any) ?? [],
      tasks: (t.tasks as any) ?? [],
    };
  },

  async findAll(): Promise<TemplateData[]> {
    const templates = await prisma.projectTemplate.findMany({
      select: { focus: true, name: true, description: true, icon: true, modules: true, columns: true, tasks: true },
    });
    return templates.map(t => ({
      focus: t.focus,
      name: t.name,
      description: t.description,
      icon: t.icon,
      modules: (t.modules as any) ?? [],
      columns: (t.columns as any) ?? undefined,
      tasks: (t.tasks as any) ?? [],
    }));
  },

  async create(data): Promise<void> {
    await prisma.projectTemplate.create({
      data: {
        focus: data.focus,
        name: data.name,
        description: data.description,
        icon: data.icon,
        modules: data.modules as any, 
        columns: (data.columns ?? []) as any,
        tasks: (data.tasks ?? []) as any,
      },
    });
  },
};