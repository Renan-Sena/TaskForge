import { Request } from 'express';

export function getAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new Error('Usuário não autenticado');
  }
  return req.user as { id: string; email: string; name: string };
}