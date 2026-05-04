import { prisma } from '../../lib/prisma.js';

export const projectPageRepository = {
    async findByProjectId(projectId: string, options?: { orderBy?: 'asc' | 'desc' }) {
        return prisma.projectPage.findMany({
            where: { projectId },
            orderBy: { order: options?.orderBy ?? 'asc' },
        });
    },

    async findById(pageId: string) {
        return prisma.projectPage.findUnique({
            where: { id: pageId },
            include: { project: { select: { ownerId: true, members: { select: { userId: true } } } } },
        });
    },

    async create(data: { projectId: string; title: string; content?: string; order?: number }) {
        let finalOrder = data.order ?? 0;
        if (data.order === undefined) {
            const count = await prisma.projectPage.count({ where: { projectId: data.projectId } });
            finalOrder = count + 1;
        }
        return prisma.projectPage.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                content: data.content ?? '',
                order: finalOrder,
            },
        });
    },

    async update(pageId: string, data: { title?: string; content?: string; order?: number }) {
        return prisma.projectPage.update({
            where: { id: pageId },
            data,
        });
    },

    async delete(pageId: string) {
        return prisma.projectPage.delete({ where: { id: pageId } });
    },

    async findRecent(projectId: string, limit: number) {
        return prisma.projectPage.findMany({
            where: { projectId },
            orderBy: { updatedAt: 'desc' },
            take: limit,
        });
    },
};