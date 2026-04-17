export interface SystemStats {
  users: { total: number; active: number; new: number };
  projects: { total: number; active: number; new: number };
  tasks: { total: number; completed: number; overdue: number };
  comments: number;
}

export interface UserAdminResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: Date;
  ownedProjects: number;
  memberProjects: number;
  createdTasks: number;
  lastActivity: Date | null;
}

export interface ProjectAdminResponse {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  membersCount: number;
  tasksCount: number;
  completedTasks: number;
  overdueTasks: number;
  createdAt: Date;
}