import { prisma } from '../../lib/prisma.js';
import type { IAuthUserRepository } from '../auth/interfaces/IAuthUserRepository.js';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByRefreshTokenHash(hash: string) {
    return prisma.user.findFirst({
      where: { refreshToken: hash },
      select: { id: true, email: true, name: true },
    });
  },

  async create(data: { name: string; email: string; password: string; avatar?: string | null }) {
    return prisma.user.create({ data });
  },

  async updateRefreshToken(userId: string, hash: string | null): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  },

  async updateLastLogin(userId: string, ip: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });
  },
};

// Type check
const _typeCheck: IAuthUserRepository = userRepository;