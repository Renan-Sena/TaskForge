import { projectRepository } from './project.repository.js';
import { taskRepository } from '../task/task.repository.js';

export const analyticsService = {
    async tasksOverTime(projectId: string, userId: string, granularity: 'week' | 'month' = 'week') {
        const project = await projectRepository.findById(projectId, userId);
        if (!project) throw new Error('Project not found or access denied');

        const tasks = project.tasks || [];
        const grouped: Record<string, { created: number; completed: number }> = {};

        const format = (date: Date) => {
            if (granularity === 'month') {
                return date.toISOString().slice(0, 7);
            }
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setDate(diff);
            return d.toISOString().slice(0, 10); 
        };

        tasks.forEach(t => {
            const createdKey = format(new Date(t.created_at));
            if (!grouped[createdKey]) grouped[createdKey] = { created: 0, completed: 0 };
            grouped[createdKey].created++;

            if (t.status === 'done' || t.status === 'Deployed') {
                const completedDate = t.updated_at ? new Date(t.updated_at) : new Date(t.created_at);
                const completedKey = format(completedDate);
                if (!grouped[completedKey]) grouped[completedKey] = { created: 0, completed: 0 };
                grouped[completedKey].completed++;
            }
        });

        return Object.entries(grouped)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([period, counts]) => ({ period, ...counts }));
    },

    async memberProductivity(projectId: string, userId: string) {
        const project = await projectRepository.findById(projectId, userId);
        if (!project) throw new Error('Project not found or access denied');

        const tasks = project.tasks || [];
        const members: Record<string, { name: string; completed: number; totalTimeDays: number; avatar?: string | null }> = {};

        tasks.forEach(t => {
            if (t.status !== 'done' && t.status !== 'Deployed') return;
            const assignee = t.assignedTo;
            if (!assignee) return;
            const id = assignee.id;
            if (!members[id]) {
                members[id] = { name: assignee.name, completed: 0, totalTimeDays: 0, avatar: assignee.avatar };
            }
            members[id].completed++;
            const created = new Date(t.created_at);
            const updated = new Date(t.updated_at);
            const days = Math.max(0, (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            members[id].totalTimeDays += days;
        });

        return Object.values(members).map(m => ({
            name: m.name,
            completed: m.completed,
            avgDays: m.completed > 0 ? Math.round((m.totalTimeDays / m.completed) * 10) / 10 : 0,
            avatar: m.avatar,
        }));
    },

    async statusDistribution(projectId: string, userId: string) {
        const project = await projectRepository.findById(projectId, userId);
        if (!project) throw new Error('Project not found or access denied');

        const tasks = project.tasks || [];
        const distribution: Record<string, number> = {};
        tasks.forEach(t => {
            const s = t.status || 'todo';
            distribution[s] = (distribution[s] || 0) + 1;
        });

        return distribution;
    },
};