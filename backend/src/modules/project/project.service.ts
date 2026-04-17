import { projectRepository } from './project.repository.js';
import { userRepository } from '../user/user.repository.js';
import type { ProjectCreateInput, ProjectUpdateInput, ProjectResponse, ProjectMemberInput } from './project.types.js';

export const projectService = {
  async create(userId: string, input: ProjectCreateInput): Promise<ProjectResponse> {
    const project = await projectRepository.create({ ...input, ownerId: userId });
    return formatProjectResponse(project);
  },

  async getById(projectId: string, userId: string): Promise<ProjectResponse> {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new Error('Projeto não encontrado ou acesso negado');
    return formatProjectResponse(project);
  },

  async getAllByUser(userId: string): Promise<ProjectResponse[]> {
    const projects = await projectRepository.findByUser(userId);
    return projects.map(formatProjectResponse);
  },

  async update(projectId: string, userId: string, input: ProjectUpdateInput): Promise<ProjectResponse> {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Sem permissão para editar este projeto');
    const project = await projectRepository.update(projectId, input);
    const updated = await projectRepository.findById(projectId, userId);
    if (!updated) throw new Error('Projeto não encontrado');
    return formatProjectResponse(updated);
  },

  async delete(projectId: string, userId: string): Promise<void> {
    const project = await projectRepository.findById(projectId, userId);
    if (!project || project.ownerId !== userId) {
      throw new Error('Apenas o proprietário pode deletar o projeto');
    }
    await projectRepository.delete(projectId);
  },

  async inviteMember(projectId: string, userId: string, input: ProjectMemberInput): Promise<void> {
    const isAdmin = await projectRepository.isAdmin(projectId, userId);
    if (!isAdmin) throw new Error('Sem permissão para convidar membros');

    const userToInvite = await userRepository.findByEmail(input.email);
    if (!userToInvite) throw new Error('Usuário não encontrado');

    const existing = await projectRepository.findMember(projectId, userToInvite.id);
    if (existing) throw new Error('Usuário já é membro do projeto');

    await projectRepository.addMember(projectId, userToInvite.id, input.role || 'member');
  },
};

function formatProjectResponse(project: any): ProjectResponse {
  const tasks = project.tasks || [];
  // Sempre retorna stats (nunca undefined)
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t: any) => t.status === 'todo').length,
    doing: tasks.filter((t: any) => t.status === 'doing').length,
    done: tasks.filter((t: any) => t.status === 'done').length,
  };
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    owner: {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      avatar: project.owner.avatar,
    },
    members: project.members.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
      },
    })),
    stats,
  };
}