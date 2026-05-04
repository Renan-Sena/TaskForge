import { calendarEventRepository } from './calendarEvent.repository.js';
import { projectRepository } from './project.repository.js';

export const calendarService = {
  async getEvents(userId: string, projectId: string, start: string, end: string) {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Project not found or access denied');

    const startDate = new Date(start);
    const endDate = new Date(end);

    const tasks = project.tasks?.filter(t => t.dueDate && t.dueDate >= startDate && t.dueDate <= endDate) ?? [];

    const events = await calendarEventRepository.findByProjectAndRange(projectId, startDate, endDate);

    return {
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        status: t.status,
        priority: t.priority,
        type: 'task',
      })),
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.startDate,
        endDate: e.endDate,
        allDay: e.allDay,
        color: e.color,
        location: e.location,
        type: 'event',
      })),
    };
  },

  async createEvent(userId: string, projectId: string, data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    color?: string;
    location?: string;
  }) {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');

    return calendarEventRepository.create({
      projectId,
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      allDay: data.allDay ?? false,
      color: data.color,
      location: data.location,
      createdById: userId,
    });
  },

  async updateEvent(userId: string, eventId: string, data: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string | null;
    allDay?: boolean;
    color?: string | null;
    location?: string | null;
  }) {
    const event = await calendarEventRepository.findById(eventId);
    if (!event) throw new Error('Event not found');
    const isAdmin = await projectRepository.isAdmin(event.projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');

    return calendarEventRepository.update(eventId, {
      title: data.title,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate === null ? null : (data.endDate ? new Date(data.endDate) : undefined),
      allDay: data.allDay,
      color: data.color,
      location: data.location,
    });
  },

  async deleteEvent(userId: string, eventId: string) {
    const event = await calendarEventRepository.findById(eventId);
    if (!event) throw new Error('Event not found');
    const isAdmin = await projectRepository.isAdmin(event.projectId, userId);
    if (!isAdmin) throw new Error('Permission denied');

    await calendarEventRepository.delete(eventId);
  },
};