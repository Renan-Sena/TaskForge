// src/modules/auth/auth.service.ts
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} from '../../utils/token.js';
import type { IAuthUserRepository } from './interfaces/IAuthUserRepository.js';
import type { User } from '@prisma/client';

export class AuthService {
  constructor(private readonly userRepo: IAuthUserRepository) {}

  /**
   * Processa login OAuth (Google, Facebook, etc.)
   * Gera tokens e salva informações de último login.
   */
  async handleOAuthLogin(user: User, ip: string) {
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await this.userRepo.updateRefreshToken(user.id, hashedRefreshToken);
    await this.userRepo.updateLastLogin(user.id, ip);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        // role: user.role, 
        createdAt: user.createdAt,
      },
    };
  }

  async refreshTokens(oldRefreshToken: string, ip: string) {
    const payload = verifyRefreshToken(oldRefreshToken);
    if (!payload || !payload.id) {
      throw new Error('Refresh token inválido ou expirado');
    }

    const hashed = hashRefreshToken(oldRefreshToken);
    const user = await this.userRepo.findByRefreshTokenHash(hashed);
    if (!user) {
      throw new Error('Refresh token já revogado ou inválido');
    }

    await this.userRepo.updateRefreshToken(user.id, null);

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const newHashed = hashRefreshToken(newRefreshToken);

    await this.userRepo.updateRefreshToken(user.id, newHashed);
    await this.userRepo.updateLastLogin(user.id, ip);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.id) return;

    const hashed = hashRefreshToken(refreshToken);
    const user = await this.userRepo.findByRefreshTokenHash(hashed);
    if (user) {
      await this.userRepo.updateRefreshToken(user.id, null);
    }
  }
}