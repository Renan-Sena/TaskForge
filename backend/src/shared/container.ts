import { AuthService } from '../modules/auth/auth.service.js';
import { authUserRepository, userRepository } from '../modules/user/user.repository.js';
import { AuditService } from '../modules/audit/audit.service.js';
import { auditLogRepository } from '../modules/audit/auditLog.repository.js';
import { TwoFactorService } from '../modules/auth/twoFactor.service.js';

export const container = {
  authService: new AuthService(authUserRepository),
  auditService: new AuditService(auditLogRepository),
  twoFactorService: new TwoFactorService(userRepository),
};