export interface CreateAuditLogInput {
  userId?: string | null;
  email?: string | null;
  action: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

export interface IAuditLogRepository {
  create(input: CreateAuditLogInput): Promise<void>;
}