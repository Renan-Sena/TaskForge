import { AuthService } from '../modules/auth/auth.service.js';
import { userRepository } from '../modules/user/user.repository.js';
import { AuditService } from '../modules/audit/audit.service.js';
import { auditLogRepository } from '../modules/audit/auditLog.repository.js';

export const container = {
  authService: new AuthService(userRepository),
  auditService: new AuditService(auditLogRepository),
};