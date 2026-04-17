import { prisma } from '../../lib/prisma.js';

export const adminRepository = {
  async getStats() {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.projectMember.count({
        where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.user.count({
        where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const [totalProjects, activeProjects, newProjects] = await Promise.all([
      prisma.project.count(),
      prisma.task
        .groupBy({
          by: ['projectId'],
          where: { updated_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        })
        .then((groups) => groups.length),
      prisma.project.count({
        where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'done' } }),
      prisma.task.count({
        where: { dueDate: { lt: new Date() }, status: { not: 'done' } },
      }),
    ]);

    const totalComments = await prisma.comment.count();

    return {
      users: { total: totalUsers, active: activeUsers, new: newUsers },
      projects: { total: totalProjects, active: activeProjects, new: newProjects },
      tasks: { total: totalTasks, completed: completedTasks, overdue: overdueTasks },
      comments: totalComments,
    };
  },

  async getAllUsers() {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
    });
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const [ownedProjects, memberProjects, createdTasks] = await Promise.all([
          prisma.project.count({ where: { ownerId: user.id } }),
          prisma.projectMember.count({ where: { userId: user.id } }),
          prisma.task.count({ where: { createdById: user.id } }),
        ]);
        return { ...user, ownedProjects, memberProjects, createdTasks };
      })
    );
    return usersWithCounts;
  },

  async getAllProjects() {
    const projects = await prisma.project.findMany({
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { created_at: 'desc' },
    });
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [membersCount, tasksCount, completedTasks, overdueTasks] = await Promise.all([
          prisma.projectMember.count({ where: { projectId: project.id } }),
          prisma.task.count({ where: { projectId: project.id } }),
          prisma.task.count({ where: { projectId: project.id, status: 'done' } }),
          prisma.task.count({
            where: {
              projectId: project.id,
              dueDate: { lt: new Date() },
              status: { not: 'done' },
            },
          }),
        ]);
        return { ...project, membersCount, tasksCount, completedTasks, overdueTasks };
      })
    );
    return projectsWithStats;
  },
};