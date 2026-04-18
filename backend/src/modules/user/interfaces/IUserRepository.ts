export interface IUser2FARepository {
  findTwoFactorSecret(userId: string): Promise<{ twoFactorSecret: string | null; twoFactorEnabled: boolean } | null>;
  
  setTempTwoFactorSecret(userId: string, secret: string): Promise<void>;
  
  enableTwoFactor(userId: string): Promise<void>;
  
  disableTwoFactor(userId: string): Promise<void>;
}