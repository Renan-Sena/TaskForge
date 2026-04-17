import { z } from 'zod/v3';

export const PASSWORD_MIN_LENGTH = 8;

export const passwordRules = {
  minLength: (val: string) => val.length >= PASSWORD_MIN_LENGTH,
  hasUpperCase: (val: string) => /[A-Z]/.test(val),
  hasLowerCase: (val: string) => /[a-z]/.test(val),
  hasNumber: (val: string) => /[0-9]/.test(val),
  hasSpecialChar: (val: string) => /[^A-Za-z0-9]/.test(val),
};

export const passwordSchema: z.ZodType<string> = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)');