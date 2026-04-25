export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'SALESPERSON';

export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}
