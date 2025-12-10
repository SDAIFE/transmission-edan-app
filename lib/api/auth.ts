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
  // 🔄 ÉTAPE 7 : APPEL HTTP AU BACKEND
  // Réception des identifiants depuis authService.login()
  // Exécution de la requête POST vers l'endpoint /auth/login du serveur
  login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
    try {
      // Envoi des identifiants au serveur backend via apiClient (Axios)
      // Le serveur valide les identifiants et retourne les tokens + données utilisateur
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // ✅ AMÉLIORATION : Préserver les informations de l'erreur originale
      const errorObj = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            statusCode?: number;
          };
        };
        code?: string;
      };

      // ✅ AMÉLIORATION : Extraire le message du backend (vérifier plusieurs formats possibles)
      // Format 1: { message: "..." } (format standard du backend)
      // Format 2: { error: "..." } (format alternatif)
      let message = errorObj.response?.data?.message;
      if (!message && errorObj.response?.data?.error) {
        message = errorObj.response.data.error;
      }
      // Si aucun message trouvé, utiliser handleApiError qui gère les cas par défaut
      if (!message) {
        message = handleApiError(error);
      }

      const statusCode = errorObj.response?.data?.statusCode;
      const code = errorObj.code;

      // if (process.env.NODE_ENV === 'development') {
      //   console.log('🔍 [AuthAPI] Erreur de connexion:', {
      //     message,
      //     statusCode,
      //     code,
      //     responseData: errorObj.response?.data
      //   });
      // }

      // Créer une erreur enrichie qui préserve toutes les informations
      const enrichedError = new Error(message) as Error & {
        statusCode?: number;
        code?: string;
        originalError?: unknown;
      };
      enrichedError.statusCode = statusCode;
      enrichedError.code = code;
      enrichedError.originalError = error;

      throw enrichedError;
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

      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🔄 [AuthAPI] Refresh response:', {
      //     hasAccessToken: !!response.data.accessToken,
      //     hasRefreshToken: !!response.data.refreshToken,
      //     hasUser: !!response.data.user,
      //     userKeys: response.data.user ? Object.keys(response.data.user) : 'no user',
      //     fullResponse: response.data
      //   });
      // }

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
      // console.warn('Erreur lors de la déconnexion');
    }
  },

  // Profil utilisateur
  // ✅ ADAPTATION : Endpoint corrigé pour correspondre au backend
  // Endpoint backend : GET /api/v1/auth/profile/me
  // Via proxy Next.js : /api/backend/auth/profile/me → ${API_URL}/api/v1/auth/profile/me
  getProfile: async (): Promise<UserResponseDto> => {
    try {
      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('🔐 [AuthAPI] Récupération du profil utilisateur...');
      // }

      // ✅ ADAPTATION : Utilisation de la route correcte /auth/profile/me
      const response = await apiClient.get('/auth/profile/me');

      // if (process.env.NODE_ENV === 'development') {
      //   console.warn('✅ [AuthAPI] Profil utilisateur récupéré:', {
      //     email: response.data.email,
      //     role: response.data.role?.code,
      //     hasCirconscriptions: !!response.data.circonscriptions?.length,
      //     hasCellules: !!response.data.cellules?.length
      //   });
      // }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [AuthAPI] Erreur récupération profil:', error);
      }
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
    } catch (error: unknown) {
      // ✅ CORRECTION : Retourner false pour les 401 au lieu de lever une exception
      const errorObj = error as { response?: { status?: number } };
      if (errorObj?.response?.status === 401) {
        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('🔐 [AuthAPI] Token invalide (401)');
        // }
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
