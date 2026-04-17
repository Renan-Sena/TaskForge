import { AuthService } from '../modules/auth/auth.service.js';
import { userRepository } from '../modules/user/user.repository.js';

export const container = {
  authService: new AuthService(userRepository),
};