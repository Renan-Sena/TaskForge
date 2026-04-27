export interface IUser2FARepository {
  /**
   * Busca o segredo 2FA do usuário (descriptografado) e o status de ativação.
   * @param userId ID do usuário
   * @returns Objeto com o segredo e status, ou null se não existir
   */
  findTwoFactorSecret(userId: string): Promise<{ twoFactorSecret: string | null; twoFactorEnabled: boolean } | null>;

  /**
   * Salva temporariamente o segredo 2FA (antes da verificação inicial).
   * @param userId ID do usuário
   * @param secret Segredo TOTP em base32 (não criptografado – o repositório deve criptografar)
   */
  setTempTwoFactorSecret(userId: string, secret: string): Promise<void>;

  /**
   * Ativa permanentemente o 2FA após verificação bem-sucedida.
   * @param userId ID do usuário
   */
  enableTwoFactor(userId: string): Promise<void>;

  /**
   * Desativa completamente o 2FA e remove o segredo.
   * @param userId ID do usuário
   */
  disableTwoFactor(userId: string): Promise<void>;

  // Backup codes
  enableTwoFactorWithBackupCodes(userId: string, backupCodesHashes: string[]): Promise<void>;
  getBackupCodesHashes(userId: string): Promise<string[]>;
  removeBackupCode(userId: string, codeHash: string): Promise<void>;
  findById(id: string): Promise<{ id: string; email: string; password: string | null } | null>;
}