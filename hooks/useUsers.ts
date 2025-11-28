// Hook personnalisé pour la gestion des utilisateurs
// ✅ ARCHITECTURE : Selon le guide GUIDE_GESTION_UTILISATEURS_FRONTEND.md

import { useState, useCallback } from 'react';
import { usersApi } from '@/lib/api/users';
import { handleApiError } from '@/lib/api/client';
import type { User, CreateUserData, UpdateUserData } from '@/lib/api/users';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<User>;
  updateUser: (userId: string, updateData: UpdateUserData) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  assignDepartments: (userId: string, departementCodes: string[]) => Promise<User>;
  assignCels: (userId: string, celCodes: string[]) => Promise<User>;
  removeAllDepartments: (userId: string) => Promise<User>;
  removeAllCels: (userId: string) => Promise<User>;
  clearError: () => void;
}

/**
 * Hook personnalisé pour gérer les utilisateurs
 * 
 * Caractéristiques :
 * - Gestion d'état complète (loading, error, data, meta)
 * - Fonctions CRUD complètes
 * - Gestion automatique des erreurs avec handleApiError
 * - Support de la pagination et de la recherche
 * - Intégration avec usersApi
 * 
 * @returns État et fonctions pour gérer les utilisateurs
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // ✅ Récupération des utilisateurs avec pagination et recherche
  const fetchUsers = useCallback(async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersApi.getUsers({ page, limit, search });
      setUsers(response.users);
      setMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useUsers] Erreur lors de la récupération:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Création d'un utilisateur
  const createUser = useCallback(async (userData: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await usersApi.createUser(userData);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return newUser;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Mise à jour d'un utilisateur
  const updateUser = useCallback(async (userId: string, updateData: UpdateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await usersApi.updateUser(userId, updateData);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return updatedUser;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Suppression d'un utilisateur
  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await usersApi.deleteUser(userId);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Assignation de départements
  const assignDepartments = useCallback(async (userId: string, departementCodes: string[]): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersApi.assignDepartments(userId, { departementCodes });
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return user;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Assignation de CELs
  const assignCels = useCallback(async (userId: string, celCodes: string[]): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersApi.assignCels(userId, { celCodes });
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return user;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Retirer tous les départements
  const removeAllDepartments = useCallback(async (userId: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersApi.removeAllDepartments(userId);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return user;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Retirer toutes les CELs
  const removeAllCels = useCallback(async (userId: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersApi.removeAllCels(userId);
      // Rafraîchir la liste
      await fetchUsers(meta.page, meta.limit);
      return user;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, fetchUsers]);

  // ✅ Nettoyage de l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    users,
    loading,
    error,
    meta,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignDepartments,
    assignCels,
    removeAllDepartments,
    removeAllCels,
    clearError,
  };
}

