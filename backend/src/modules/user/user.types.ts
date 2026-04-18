export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  createdAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseWith2FA {
  requiresTwoFactor: true;
  tempToken: string;
}

export type LoginResult = AuthResponse | LoginResponseWith2FA;