/**
 * Types pour l'authentification
 */

export type UserRole = 'USER' | 'ADMIN' | 'SADMIN';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

