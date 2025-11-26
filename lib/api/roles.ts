import { apiClient } from './client';

// Interface pour les rôles
export interface Role {
  id: string;
  code: string;
  name: string;
}

// Service API pour les rôles
export const rolesApi = {
  // Récupérer la liste des rôles
  getRoles: async (): Promise<Role[]> => {
    try {
      console.log('🔐 [RolesAPI] Récupération des rôles...');
      
      const response = await apiClient.get('/roles');
      
      console.log('✅ [RolesAPI] Rôles récupérés:', response.data.length);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [RolesAPI] Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  },

  // Récupérer la liste simple des rôles (conforme au guide API)
  getRolesSimple: async (): Promise<Role[]> => {
    try {
      const response = await apiClient.get('/roles/list/simple');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [RolesAPI] Erreur lors de la récupération de la liste simple:', error);
      // Fallback sur la route normale si la route simple n'existe pas
      return rolesApi.getRoles();
    }
  },
};
