import { projectRepository } from './project.repository.js';

export const exportService = {
  async exportTasks(
    projectId: string,
    userId: string,
    format: 'csv' | 'json',
    start?: string,
    end?: string
  ): Promise<string> {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Project not found or access denied');

    let tasks = project.tasks || [];

    if (start || end) {
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;
      tasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        if (isNaN(due.getTime())) return false;
        if (startDate && !isNaN(startDate.getTime()) && due < startDate) return false;
        if (endDate && !isNaN(endDate.getTime()) && due > endDate) return false;
        return true;
      });
    }

    if (format === 'json') {
      return JSON.stringify(tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() ?? null,
        assignedTo: t.assignedTo?.name ?? null,
        createdBy: t.createdBy?.name ?? null,
      })), null, 2);
    }

    // CSV
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assigned To', 'Created By'];
    const rows = tasks.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status || 'todo',
      t.priority || 'medium',
      t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
      t.assignedTo?.name || '',
      t.createdBy?.name || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },
};