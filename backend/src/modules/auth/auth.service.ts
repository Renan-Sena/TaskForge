import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} from '../../utils/token.js';
import type { IAuthUserRepository } from './interfaces/IAuthUserRepository.js';
import type { User } from '@prisma/client';
import { container } from '../../shared/container.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export class AuthService {
  constructor(private readonly userRepo: IAuthUserRepository) {}

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

  async verify2FA(tempToken: string, code: string, ip: string) {
    let payload;
    try {
      payload = jwt.verify(tempToken, env.JWT_SECRET) as { userId: string; purpose: string };
    } catch {
      throw new Error('Token temporário inválido ou expirado');
    }
    if (payload.purpose !== '2fa') throw new Error('Token com propósito inválido');

    const userId = payload.userId;
    const isValid = await container.twoFactorService.validateToken(userId, code);
    if (!isValid) {
      await container.auditService.log({
        userId,
        action: 'LOGIN_2FA_FAILURE',
        ip,
        metadata: { reason: 'Código 2FA inválido' },
      });
      throw new Error('Código 2FA inválido');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await this.userRepo.updateRefreshToken(user.id, hashedRefreshToken);
    await this.userRepo.updateLastLogin(user.id, ip);

    await container.auditService.log({
      userId,
      email: user.email,
      action: 'LOGIN_SUCCESS_2FA',
      ip,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}