// backend/src/modules/user/user.service.ts (trecho adicionado)

import { userRepository } from './user.repository.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token.js';
import type { UserCreateInput, LoginInput, AuthResponse, UserResponse } from './user.types.js';

export const userService = {
  async register(input: UserCreateInput): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new Error('Email já cadastrado');

    const hashedPassword = await hashPassword(input.password);
    const user = await userRepository.create({ ...input, password: hashedPassword });

    const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, name: user.name });

    await userRepository.updateRefreshToken(user.id, refreshToken);

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
    if (!user) throw new Error('Email ou senha inválidos');

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) throw new Error('Email ou senha inválidos');

    const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, name: user.name });

    await userRepository.updateRefreshToken(user.id, refreshToken);

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

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error('Refresh token inválido');

    const user = await userRepository.findById(decoded.id);
    if (!user) throw new Error('Usuário não encontrado');

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });
    return { accessToken: newAccessToken };
  },

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  },

  // 🔹 NOVO MÉTODO ADICIONADO
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