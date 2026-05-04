import { prisma } from '../../lib/prisma.js';

export const calendarEventRepository = {
    async findByProjectAndRange(projectId: string, start: Date, end: Date) {
        return prisma.calendarEvent.findMany({
            where: {
                projectId,
                startDate: { gte: start, lte: end },
            },
            orderBy: { startDate: 'asc' },
        });
    },

    async findById(eventId: string) {
        return prisma.calendarEvent.findUnique({
            where: { id: eventId },
            include: { project: { select: { ownerId: true, members: { select: { userId: true } } } } },
        });
    },

    async create(data: {
        projectId: string;
        title: string;
        description?: string;
        startDate: Date;
        endDate?: Date;
        allDay?: boolean;
        color?: string;
        location?: string;
        createdById: string;
    }) {
        return prisma.calendarEvent.create({ data });
    },

    async update(eventId: string, data: {
        title?: string;
        description?: string;
        startDate?: Date;
        endDate?: Date | null;
        allDay?: boolean;
        color?: string | null;
        location?: string | null;
    }) {
        return prisma.calendarEvent.update({
            where: { id: eventId },
            data,
        });
    },

    async delete(eventId: string) {
        return prisma.calendarEvent.delete({ where: { id: eventId } });
    },

    async findUpcoming(projectId: string, from: Date, limit: number) {
        return prisma.calendarEvent.findMany({
            where: {
                projectId,
                startDate: { gte: from },
            },
            orderBy: { startDate: 'asc' },
            take: limit,
        });
    },
};