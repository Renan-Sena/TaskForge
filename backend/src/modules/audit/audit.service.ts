import type { IAuditLogRepository } from './interfaces/IAuditLogRepository.js';

export class AuditService {
  constructor(private readonly auditRepo: IAuditLogRepository) {}

  async log(entry: {
    userId?: string | null;
    email?: string | null;
    action: string;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, any> | null;
  }): Promise<void> {
    try {
      await this.auditRepo.create(entry);
    } catch (error) {
      // Log de erro, mas não deve quebrar o fluxo principal
      console.error('Falha ao registrar log de auditoria:', error);
    }
  }
}