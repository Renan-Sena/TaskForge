import { prisma } from '../../lib/prisma.js';
import type { UserCreateInput } from './user.types.js';

export const userRepository = {
  async create(data: UserCreateInput & { password: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        avatar: data.avatar ?? null,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async updateRefreshToken(id: string, refreshToken: string | null) {
    // Se você adicionar campo refreshToken no schema, descomente:
    // return prisma.user.update({ where: { id }, data: { refreshToken } });
    // Por enquanto, apenas retorna o usuário
    return prisma.user.findUnique({ where: { id } });
  },
};