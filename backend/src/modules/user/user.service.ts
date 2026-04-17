import { userRepository } from './user.repository.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} from '../../utils/token.js';
import type { UserCreateInput, LoginInput, AuthResponse, UserResponse } from './user.types.js';

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

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.password) throw new Error('Email ou senha inválidos');

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) throw new Error('Email ou senha inválidos');

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

  async refreshToken(oldRefreshToken: string) {
    const payload = verifyRefreshToken(oldRefreshToken);
    if (!payload || !payload.id) {
      throw new Error('Refresh token inválido ou expirado');
    }

    const hashed = hashRefreshToken(oldRefreshToken);
    const user = await userRepository.findByRefreshTokenHash(hashed);
    if (!user) {
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

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
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