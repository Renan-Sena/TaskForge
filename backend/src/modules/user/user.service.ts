import { userRepository } from './user.repository.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} from '../../utils/token.js';
import type { UserCreateInput, LoginInput, AuthResponse, UserResponse } from './user.types.js';
import { container } from '../../shared/container.js';

const auditService = container.auditService;

export const userService = {
  async register(input: UserCreateInput): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new Error('Email já cadastrado');

    const hashedPassword = await hashPassword(input.password);
    const user = await userRepository.create({ ...input, password: hashedPassword });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await userRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(input: LoginInput, metadata?: { ip?: string; userAgent?: string }): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      await auditService.log({
        email: input.email,
        action: 'LOGIN_FAILURE',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        metadata: { reason: 'Email não encontrado ou senha não definida' },
      });
      throw new Error('Email ou senha inválidos');
    }

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) {
      await auditService.log({
        userId: user.id,
        email: user.email,
        action: 'LOGIN_FAILURE',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        metadata: { reason: 'Senha incorreta' },
      });
      throw new Error('Email ou senha inválidos');
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await userRepository.updateRefreshToken(user.id, hashedRefreshToken);

    await auditService.log({
      userId: user.id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(oldRefreshToken: string, metadata?: { ip?: string; userAgent?: string }) {
    const payload = verifyRefreshToken(oldRefreshToken);
    if (!payload || !payload.id) {
      await auditService.log({
        action: 'REFRESH_FAILURE',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        metadata: { reason: 'Token inválido ou expirado' },
      });
      throw new Error('Refresh token inválido ou expirado');
    }

    const hashed = hashRefreshToken(oldRefreshToken);
    const user = await userRepository.findByRefreshTokenHash(hashed);
    if (!user) {
      await auditService.log({
        userId: payload.id,
        action: 'REFRESH_FAILURE',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        metadata: { reason: 'Token não encontrado ou já revogado' },
      });
      throw new Error('Refresh token não encontrado ou já revogado');
    }

    // Invalida token antigo
    await userRepository.updateRefreshToken(user.id, null);

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const newHashed = hashRefreshToken(newRefreshToken);

    await userRepository.updateRefreshToken(user.id, newHashed);

    // Opcional: log de refresh bem‑sucedido
    // await auditService.log({ ... });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(userId: string, metadata?: { ip?: string; userAgent?: string; email?: string }): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);

    await auditService.log({
      userId,
      email: metadata?.email,
      action: 'LOGOUT',
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });
  },

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.created_at,
    };
  },
};