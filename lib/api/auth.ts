import { apiClient, handleApiError } from './client';
import type { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto, 
  UserResponseDto,
  CreateUserDto 
} from '@/types/auth';

// Service d'authentification
export const authApi = {
  // Connexion
  login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Inscription
  register: async (userData: RegisterDto): Promise<UserResponseDto> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Refresh du token
  // ✅ CORRECTION : Ne pas déclencher un refresh supplémentaire lors du refresh
  refresh: async (refreshToken: string): Promise<AuthResponseDto> => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken }, {
        // Éviter une boucle de refresh
        headers: {
          'X-Skip-Auth-Refresh': 'true'
        }
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [AuthAPI] Refresh response:', {
          hasAccessToken: !!response.data.accessToken,
          hasRefreshToken: !!response.data.refreshToken,
          hasUser: !!response.data.user,
          userKeys: response.data.user ? Object.keys(response.data.user) : 'no user',
          fullResponse: response.data
        });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // On ignore les erreurs de déconnexion
      console.warn('Erreur lors de la déconnexion');
    }
  },

  // Profil utilisateur
  getProfile: async (): Promise<UserResponseDto> => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Vérification du token
  // ✅ CORRECTION : Ne pas déclencher de refresh automatique lors de la vérification
  verify: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/verify', {
        // Marquer cette requête pour éviter le refresh automatique
        headers: {
          'X-Skip-Auth-Refresh': 'true'
        }
      });
      return true;
    } catch (error: any) {
      // ✅ CORRECTION : Retourner false pour les 401 au lieu de lever une exception
      if (error?.response?.status === 401) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 [AuthAPI] Token invalide (401)');
        }
        return false;
      }
      return false;
    }
  },

  // Création d'utilisateur (Admin/SuperAdmin)
  createUser: async (userData: CreateUserDto): Promise<UserResponseDto> => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mise à jour du profil
  updateProfile: async (updates: Partial<UserResponseDto>): Promise<UserResponseDto> => {
    try {
      const response = await apiClient.patch('/users/profile/me', updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
