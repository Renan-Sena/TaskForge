import PDFDocument from 'pdfkit';
import { projectRepository } from './project.repository.js';

export const reportService = {
  async generateProjectReport(projectId: string, userId: string, start?: string, end?: string): Promise<Buffer> {
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

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // Header
    doc.fontSize(20).text(`Project Report: ${project.name}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Description: ${project.description || 'N/A'}`);
    doc.text(`Focus: ${(project.focus || []).join(', ') || 'None'}`);
    const createdDate = project.created_at ? new Date(project.created_at) : new Date();
    doc.text(`Created: ${createdDate.toLocaleDateString()}`);
    doc.text(`Members: ${project.members?.length || 0}`);
    doc.moveDown();

    // Task distribution
    const tasksByStatus: Record<string, number> = {};
    tasks.forEach(t => {
      const s = t.status || 'todo';
      tasksByStatus[s] = (tasksByStatus[s] || 0) + 1;
    });

    doc.fontSize(14).text('Task Distribution', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    for (const [status, count] of Object.entries(tasksByStatus)) {
      doc.text(`${status}: ${count}`);
    }
    doc.moveDown();

    // MMetrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'Deployed').length;
    doc.text(`Total tasks in report: ${totalTasks}`);
    doc.text(`Completed: ${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)`);
    doc.moveDown();

    // Task list
    doc.fontSize(14).text('Tasks', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    tasks.forEach((task, index) => {
      const status = task.status || 'todo';
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const dueStr = dueDate && !isNaN(dueDate.getTime()) ? dueDate.toLocaleDateString() : 'No due date';
      doc.text(`${index + 1}. ${task.title} [${status}] - Due: ${dueStr}`);
    });

    doc.end();
    return pdfPromise;
  }
};