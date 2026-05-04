import { projectRepository } from './project.repository.js';
import { taskRepository } from '../task/task.repository.js';
import { calendarEventRepository } from './calendarEvent.repository.js';
import { projectPageRepository } from './projectPage.repository.js';

export const dashboardService = {
  async getDashboard(userId: string, projectId: string) {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Project not found or access denied');

    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'Deployed').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByStatus: Record<string, number> = {};
    tasks.forEach(t => {
      tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    });

    const recentCompleted = tasks
      .filter(t => t.status === 'done' || t.status === 'Deployed')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map(t => ({ id: t.id, title: t.title, completedAt: t.updated_at }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = await calendarEventRepository.findUpcoming(projectId, today, 5);

    const recentPages = await projectPageRepository.findRecent(projectId, 5);

    const summary = {
      id: project.id,
      name: project.name,
      description: project.description,
      focus: project.focus,
      createdAt: project.created_at,
      membersCount: project.members?.length || 0,
    };

    return {
      summary,
      progress: {
        totalTasks,
        completedTasks,
        percent: progressPercent,
        byStatus: tasksByStatus,
      },
      recentCompleted,
      upcomingEvents: upcomingEvents.map(e => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location,
      })),
      recentPages: recentPages.map(p => ({
        id: p.id,
        title: p.title,
        updatedAt: p.updatedAt,
      })),
    };
  },
};