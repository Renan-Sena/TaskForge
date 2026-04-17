import { prisma } from '../../lib/prisma.js';
import type { IAuditLogRepository, CreateAuditLogInput } from './interfaces/IAuditLogRepository.js';

export const auditLogRepository: IAuditLogRepository = {
  async create(input: CreateAuditLogInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        email: input.email,
        action: input.action,
        ip: input.ip,
        userAgent: input.userAgent,
        metadata: input.metadata === null ? undefined : input.metadata,
      },
    });
  },
};