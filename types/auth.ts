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
  isConnected?: boolean;        // Optionnel selon la réponse
  lastConnectionAt?: Date | string;     // Peut être string ISO ou Date
  // ✅ ADAPTATION : Structure selon la réponse réelle du backend
  circonscriptions?: {
    id: number;
    COD_CE: string;
    LIB_CE: string;
  }[];
  // ✅ ADAPTATION : Ancien format pour compatibilité
  departements?: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
  }[];
  // ✅ ADAPTATION : Structure selon la réponse réelle du backend
  cellules?: {
    COD_CEL: string;
    LIB_CEL: string;
  }[];
  // ✅ ADAPTATION : Ancien format pour compatibilité
  cellulesOld?: {
    id: string;
    codeCellule: string;
    libelleCellule: string;
  }[];
  // ✅ ADAPTATION : Session active (nouveau champ)
  activeSession?: {
    createdAt: string;  // ISO string
    expiresAt: string;  // ISO string
  };
  createdAt: Date | string;  // Peut être string ISO ou Date
  updatedAt: Date | string;  // Peut être string ISO ou Date
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
