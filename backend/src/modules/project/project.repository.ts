import { prisma } from '../../lib/prisma.js';
import type { ProjectCreateInput, ProjectUpdateInput } from './project.types.js';

export const projectRepository = {
  async create(data: ProjectCreateInput & { ownerId: string; focus?: string[] }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
        focus: data.focus ?? [],
        members: {
          create: { userId: data.ownerId, role: 'owner' },
        },
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
    });
  },

  async findById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: {
        id,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: true,
        members: { include: { user: true } },
        tasks: {
          include: {
            assignedTo: true,
            createdBy: true,
            comments: { include: { user: true }, orderBy: { created_at: 'desc' } },
          },
          orderBy: { created_at: 'desc' },
        },
        config: true,
      },
    });
  },

  async findByUser(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: true,
        members: { include: { user: true } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  },

  async update(id: string, data: ProjectUpdateInput) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    return prisma.project.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  async addMember(projectId: string, userId: string, role: string = 'member') {
    return prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: true },
    });
  },

  async findMember(projectId: string, userId: string) {
    return prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  async isAdmin(projectId: string, userId: string) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return member ? member.role === 'owner' || member.role === 'admin' : false;
  },

  async upsertConfig(projectId: string, modules: any[]) {
    return prisma.projectConfig.upsert({
      where: { projectId },
      update: { modules },
      create: { projectId, modules },
    });
  },

  async getConfig(projectId: string) {
    return prisma.projectConfig.findUnique({ where: { projectId } });
  },
};