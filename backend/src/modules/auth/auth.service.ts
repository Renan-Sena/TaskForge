import { prisma } from '../../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../../utils/token.js';

export const authService = {
  async handleOAuthLogin(user: any, ip: string) {
    const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } };
  },
};