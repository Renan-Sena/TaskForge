export interface TaskCreateInput {
  title: string;
  description?: string;
  projectId: string;
  assignedToId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedToId?: string;
  dueDate?: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  projectId: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string };
  assignedTo: { id: string; name: string; avatar: string | null } | null;
  comments?: CommentResponse[];
}

export interface CommentCreateInput {
  content: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  userId: string;
  taskId: string;
  createdAt: Date;
  user: { id: string; name: string; avatar: string | null };
}