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