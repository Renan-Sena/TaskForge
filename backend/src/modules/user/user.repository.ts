import { prisma } from '../../lib/prisma.js';
import type { IAuthUserRepository } from '../auth/interfaces/IAuthUserRepository.js';
import type { IUser2FARepository } from './interfaces/IUser2FARepository.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('❌ TWO_FACTOR_ENCRYPTION_KEY não definida no ambiente');
}
const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex'),
  });
}

function decrypt(encryptedJson: string): string {
  const { iv, content, tag } = JSON.parse(encryptedJson);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

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

  async findTwoFactorSecret(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });
    if (!user?.twoFactorSecret) return null;
    return {
      twoFactorSecret: decrypt(user.twoFactorSecret),
      twoFactorEnabled: user.twoFactorEnabled,
    };
  },

  async setTempTwoFactorSecret(userId: string, secret: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encrypt(secret),
        twoFactorEnabled: false,
        twoFactorVerified: false,
      },
    });
  },

  async enableTwoFactor(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, twoFactorVerified: true },
    });
  },

  async disableTwoFactor(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorVerified: false,
      },
    });
  },

  /**
   * @param userId 
   * @param backupCodesHashes 
   */
  async enableTwoFactorWithBackupCodes(userId: string, backupCodesHashes: string[]): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorVerified: true,
        backupCodes: backupCodesHashes,
      },
    });
  },

  async getBackupCodesHashes(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });
    return user?.backupCodes ?? [];
  },

  async removeBackupCode(userId: string, codeHash: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });
    if (user) {
      const updated = user.backupCodes.filter(h => h !== codeHash);
      await prisma.user.update({
        where: { id: userId },
        data: { backupCodes: updated },
      });
    }
  },
};

const adaptUser = (user: any) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.created_at,
  };
};

export const authUserRepository: IAuthUserRepository = {
  updateRefreshToken: userRepository.updateRefreshToken,
  findByRefreshTokenHash: userRepository.findByRefreshTokenHash,
  updateLastLogin: userRepository.updateLastLogin,
  findById: async (id) => {
    const user = await userRepository.findById(id);
    return adaptUser(user);
  },
};

// ---------------- Verificações de tipo ----------------
const _typeCheckAuth: IAuthUserRepository = authUserRepository;
// O IUser2FARepository precisa ser atualizado para incluir os novos métodos, mas a verificação continua válida.
const _typeCheck2FA: IUser2FARepository = userRepository;