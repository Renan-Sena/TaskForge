export interface IAuthUserRepository {
  updateRefreshToken(userId: string, hash: string | null): Promise<void>;
  findByRefreshTokenHash(hash: string): Promise<{ id: string; email: string; name: string } | null>;
  updateLastLogin(userId: string, ip: string): Promise<void>;
  findById(id: string): Promise<{ id: string; email: string; name: string; avatar: string | null; role: string; createdAt: Date } | null>;
}