import { apiClient } from './interceptor';
import type {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserResponseDto,
} from '@/types/auth';

/**
 * Client API pour l'authentification
 */
export const authApi = {
  /**
   * Connexion
   */
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Inscription
   */
  async register(userData: RegisterDto): Promise<UserResponseDto> {
    const response = await apiClient.post<UserResponseDto>('/auth/register', userData);
    return response.data;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Récupère le profil utilisateur actuel
   */
  async getCurrentUser(): Promise<UserResponseDto> {
    const response = await apiClient.get<UserResponseDto>('/auth/me');
    return response.data;
  },

  /**
   * Rafraîchit le token d'accès
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    return response.data;
  },

  /**
   * Vérifie si le token est valide
   */
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/token');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Met à jour le profil utilisateur
   */
  async updateProfile(updates: Partial<UserResponseDto>): Promise<UserResponseDto> {
    const response = await apiClient.patch<UserResponseDto>('/auth/profile', updates);
    return response.data;
  },
};

