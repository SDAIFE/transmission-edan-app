import { apiClient } from './client';

// Types basés sur l'API documentation
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
  isConnected: boolean;
  lastConnectionAt: string;
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
  departementCodes?: string[];
  celCodes?: string[];
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  departementCodes?: string[];
  celCodes?: string[];
  isActive?: boolean;
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

// Service API pour les utilisateurs
export const usersApi = {
  // Créer un utilisateur
  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      console.log('👥 [UsersAPI] Création d\'utilisateur...');
      console.log('📤 [UsersAPI] Données envoyées:', JSON.stringify(userData, null, 2));
      
      const response = await apiClient.post('/users', userData);
      
      console.log('✅ [UsersAPI] Utilisateur créé:', response.data.email);
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
        console.log('👥 [UsersAPI] Récupération des utilisateurs...', params);
      }
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/users?${queryString}` : '/users';
      
      const response = await apiClient.get(url);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Utilisateurs récupérés:', response.data.total);
      }
      return response.data;
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
        console.log('👥 [UsersAPI] Récupération de l\'utilisateur:', id);
      }
      
      const response = await apiClient.get(`/users/${id}`);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Utilisateur récupéré:', response.data.email);
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
        console.log('👥 [UsersAPI] Modification de l\'utilisateur:', id);
      }
      
      const response = await apiClient.patch(`/users/${id}`, userData);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Utilisateur modifié:', response.data.email);
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
        console.log('👥 [UsersAPI] Suppression de l\'utilisateur:', id);
      }
      
      await apiClient.delete(`/users/${id}`);
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Utilisateur supprimé');
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
        console.log('👥 [UsersAPI] Assignation des départements:', id, data.departementCodes);
      }
      
      const response = await apiClient.patch(`/users/${id}/departements`, data);
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Départements assignés');
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
        console.log('👥 [UsersAPI] Suppression de tous les départements:', id);
      }
      
      const response = await apiClient.delete(`/users/${id}/departements`);
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Tous les départements supprimés');
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
        console.log('👥 [UsersAPI] Assignation des CELs:', id, data.celCodes);
      }
      
      const response = await apiClient.patch(`/users/${id}/cels`, data);
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] CELs assignés');
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
        console.log('👥 [UsersAPI] Suppression de toutes les CELs:', id);
      }
      
      const response = await apiClient.delete(`/users/${id}/cels`);
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Toutes les CELs supprimées');
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la suppression des CELs:', error);
      throw error;
    }
  },

  // Récupérer mon profil
  getMyProfile: async (): Promise<User> => {
    try {
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('👥 [UsersAPI] Récupération du profil personnel...');
      }
      
      const response = await apiClient.get('/users/profile/me');
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Profil récupéré:', response.data.email);
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
        console.log('👥 [UsersAPI] Modification du profil personnel...');
      }
      
      const response = await apiClient.patch('/users/profile/me', userData);
      
      //en developpement
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [UsersAPI] Profil modifié:', response.data.email);
      }
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [UsersAPI] Erreur lors de la modification du profil:', error);
      throw error;
    }
  },
};
