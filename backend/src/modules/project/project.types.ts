export interface ProjectCreateInput {
  name: string;
  description?: string;
  focus?: string[];   
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  focus?: string[];            
  config?: any | null;          
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  members: {
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
    };
  }[];
  stats: {
    total: number;
    todo: number;
    doing: number;
    done: number;
  };
}

export interface ProjectMemberInput {
  email: string;
  role?: 'member' | 'admin';
}