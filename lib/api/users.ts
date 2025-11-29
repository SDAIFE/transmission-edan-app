import { apiClient } from './client';

// Types basés sur l'API documentation
// ✅ ADAPTATION : Structure selon la réponse réelle du backend
export interface User {
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
  // ✅ OPTIONNEL : Ces champs peuvent ne pas être présents dans la réponse
  isConnected?: boolean;
  lastConnectionAt?: string;
  // ✅ ADAPTATION : Le backend retourne circonscriptions (pas departements)
  circonscriptions?: {
    id: number;
    COD_CE: string;
    LIB_CE?: string;
  }[];
  // ✅ COMPATIBILITÉ : Ancien format pour compatibilité
  departements?: {
    id: string;
    codeDepartement: string;
    libelleDepartement: string;
  }[];
  // ✅ ADAPTATION : Le backend retourne cellules avec COD_CEL et LIB_CEL
  cellules?: {
    COD_CEL: string;
    LIB_CEL?: string;
  }[];
  // ✅ COMPATIBILITÉ : Ancien format pour compatibilité
  cellulesOld?: {
    id: string;
    codeCellule: string;
    libelleCellule: string;
  }[];
  // ✅ ADAPTATION : Session active (nouveau champ)
  activeSession?: {
    createdAt: string;
    expiresAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  circonscriptionCodes?: string[]; // ✅ NOUVEAU : Utiliser circonscriptionCodes au lieu de departementCodes
  isActive?: boolean;
  // ❌ SUPPRIMÉ : celCodes (calculé automatiquement par le backend)
  // ❌ SUPPRIMÉ : departementCodes (remplacé par circonscriptionCodes)
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  // ❌ SUPPRIMÉ : circonscriptionCodes (utiliser endpoint séparé)
  // ❌ SUPPRIMÉ : celCodes (calculé automatiquement)
  // ❌ SUPPRIMÉ : departementCodes (remplacé par circonscriptionCodes)
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AssignDepartmentsData {
  departementCodes: string[];
}

export interface AssignCelsData {
  celCodes: string[];
}

// ✅ NOUVEAU : Interface pour assigner les circonscriptions
export interface AssignCirconscriptionsData {
  circonscriptionCodes: string[];
}

// Service API pour les utilisateurs
export const usersApi = {
  // Créer un utilisateur
  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      console.warn('👥 [UsersAPI] Création d\'utilisateur...');
      console.warn('📤 [UsersAPI] Données envoyées:', JSON.stringify(userData, null, 2));

      const response = await apiClient.post('/users', userData);

      console.warn('✅ [UsersAPI] Utilisateur créé:', response.data.email);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la création:', error);

      // Log plus détaillé de l'erreur
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown; status: number } };
        console.error('📥 [UsersAPI] Réponse d\'erreur du serveur:', {
          status: axiosError.response.status,
          data: axiosError.response.data
        });
      }

      throw error;
    }
  },

  // Lister les utilisateurs avec pagination et recherche
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UserListResponse> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Récupération des utilisateurs...', params);
      }

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = queryString ? `/users?${queryString}` : '/users';

      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] URL:', url);
      }

      const response = await apiClient.get(url);

      // ✅ ADAPTATION : Le backend retourne { data: [...], meta: {...} }
      // On transforme en { users: [...], total: ..., page: ..., limit: ..., totalPages: ... }
      const backendResponse = response.data;

      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Réponse backend reçue');
        console.warn('✅ [UsersAPI] Structure:', {
          hasData: !!backendResponse.data,
          hasMeta: !!backendResponse.meta,
          dataLength: backendResponse.data?.length || 0,
          metaTotal: backendResponse.meta?.total || 0,
        });
      }

      // ✅ TRANSFORMATION : Adapter la structure de réponse du backend
      if (backendResponse.data && backendResponse.meta) {
        // Format backend : { data: [...], meta: {...} }

        // ✅ DÉDUPLICATION : Supprimer les utilisateurs en double (même ID)
        // Le backend peut retourner des doublons, on les filtre par ID unique
        const uniqueUsersMap = new Map<string, User>();
        backendResponse.data.forEach((user: User) => {
          if (user.id && !uniqueUsersMap.has(user.id)) {
            uniqueUsersMap.set(user.id, user);
          }
        });
        const uniqueUsers = Array.from(uniqueUsersMap.values());

        if (process.env.NODE_ENV === 'development') {
          const duplicatesCount = backendResponse.data.length - uniqueUsers.length;
          if (duplicatesCount > 0) {
            console.warn(`⚠️ [UsersAPI] ${duplicatesCount} utilisateur(s) en double détecté(s) et supprimé(s)`);
          }
          console.warn('✅ [UsersAPI] Utilisateurs transformés:', uniqueUsers.length);
        }

        const transformedResponse = {
          users: uniqueUsers,
          total: backendResponse.meta.total,
          page: backendResponse.meta.page,
          limit: backendResponse.meta.limit,
          totalPages: backendResponse.meta.totalPages,
        };

        return transformedResponse;
      }

      // ✅ COMPATIBILITÉ : Si la réponse est déjà au bon format
      if (backendResponse.users) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('✅ [UsersAPI] Format déjà correct');
        }
        return backendResponse;
      }

      // ✅ FALLBACK : Si aucune structure reconnue
      console.warn('⚠️ [UsersAPI] Structure de réponse inattendue:', backendResponse);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la récupération:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  getUser: async (id: string): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Récupération de l\'utilisateur:', id);
      }

      const response = await apiClient.get(`/users/${id}`);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Utilisateur récupéré:', response.data.email);
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la récupération:', error);
      throw error;
    }
  },

  // Modifier un utilisateur
  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Modification de l\'utilisateur:', id);
      }

      const response = await apiClient.put(`/users/${id}`, userData);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Utilisateur modifié:', response.data.email);
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la modification:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (id: string): Promise<void> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Suppression de l\'utilisateur:', id);
      }

      await apiClient.delete(`/users/${id}`);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Utilisateur supprimé');
      }
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la suppression:', error);
      throw error;
    }
  },

  // Assigner des départements à un utilisateur
  assignDepartments: async (id: string, data: AssignDepartmentsData): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Assignation des départements:', id, data.departementCodes);
      }

      const response = await apiClient.patch(`/users/${id}/departements`, data);

      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Départements assignés');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de l\'assignation:', error);
      throw error;
    }
  },

  // Retirer tous les départements d'un utilisateur
  removeAllDepartments: async (id: string): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Suppression de tous les départements:', id);
      }

      const response = await apiClient.delete(`/users/${id}/departements`);

      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Tous les départements supprimés');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la suppression des départements:', error);
      throw error;
    }
  },

  // Assigner des CELs à un utilisateur
  assignCels: async (id: string, data: AssignCelsData): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Assignation des CELs:', id, data.celCodes);
      }

      const response = await apiClient.patch(`/users/${id}/cels`, data);

      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] CELs assignés');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de l\'assignation des CELs:', error);
      throw error;
    }
  },

  // Retirer toutes les CELs d'un utilisateur
  removeAllCels: async (id: string): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Suppression de toutes les CELs:', id);
      }

      const response = await apiClient.delete(`/users/${id}/cels`);

      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Toutes les CELs supprimées');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la suppression des CELs:', error);
      throw error;
    }
  },

  // ✅ NOUVEAU : Assigner des circonscriptions à un utilisateur
  // Les CELs seront automatiquement recalculées par le backend
  assignCirconscriptions: async (id: string, data: AssignCirconscriptionsData): Promise<User> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Assignation des circonscriptions:', id, data.circonscriptionCodes);
      }

      const response = await apiClient.post(`/users/${id}/circonscriptions`, data);

      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Circonscriptions assignées. Les CELs seront automatiquement recalculées.');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de l\'assignation des circonscriptions:', error);
      throw error;
    }
  },

  // Récupérer mon profil
  getMyProfile: async (): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Récupération du profil personnel...');
      }

      const response = await apiClient.get('/users/profile/me');

      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Profil récupéré:', response.data.email);
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la récupération du profil:', error);
      throw error;
    }
  },

  // Modifier mon profil
  updateMyProfile: async (userData: UpdateProfileData): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('👥 [UsersAPI] Modification du profil personnel...');
      }

      const response = await apiClient.patch('/users/profile/me', userData);

      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ [UsersAPI] Profil modifié:', response.data.email);
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la modification du profil:', error);
      throw error;
    }
  },
};
