// Types d'authentification - Alignés avec les DTOs backend

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  isActive: boolean;
  isConnected: boolean;        // ✨ NOUVEAU
  lastConnectionAt?: Date;     // ✨ NOUVEAU
  departements: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
  }[];
  cellules: {
    id: string;
    codeCellule: string;
    libelleCellule: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId?: string;
  departementCodes?: string[];
  celCodes?: string[];
  isActive?: boolean;
}

// Types simples pour les listes de sélection (conformes au guide API)
export interface Role {
  id: string;
  code: string;
  name: string;
}

export interface Departement {
  codeDepartement: string;
  libelleDepartement: string;
}

export interface Cel {
  codeCellule: string;
  libelleCellule: string;
}

// Types pour NextAuth.js
export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departements: string[];
  accessToken: string;
}

export interface NextAuthSession {
  user: SessionUser;
  expires: string;
}
