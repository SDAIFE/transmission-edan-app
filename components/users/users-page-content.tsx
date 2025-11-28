'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import type { User } from '@/lib/api';
import { UsersPageHeader } from './users-page-header';
import { UsersStatsCards } from './users-stats-cards';
import { UsersFilters } from './users-filters';
import { UsersTable } from './users-table';
import { UsersModals } from './users-modals';

export function UsersPageContent() {
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // ✅ UTILISATION DU HOOK : Utilise useUsers pour la gestion des utilisateurs
  const {
    users,
    loading,
    error,
    meta,
    fetchUsers,
    clearError,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);

  // États des modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [departmentsModalOpen, setDepartmentsModalOpen] = useState(false);
  const [celsModalOpen, setCelsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Vérifier les permissions
  const canManageUsers = currentUser?.role?.code === 'SADMIN' || currentUser?.role?.code === 'ADMIN';

  // ✅ UTILISATION DU HOOK : Chargement initial et recherche
  useEffect(() => {
    if (isAuthenticated && canManageUsers) {
      fetchUsers(currentPage, 10, searchTerm);
    }
  }, [isAuthenticated, canManageUsers, currentPage, searchTerm, fetchUsers]);

  // Handlers pour les modales
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleManageDepartments = (user: User) => {
    setSelectedUser(user);
    setDepartmentsModalOpen(true);
  };

  const handleManageCels = (user: User) => {
    setSelectedUser(user);
    setCelsModalOpen(true);
  };

  // ✅ UTILISATION DU HOOK : Rafraîchir après les actions des modales
  const handleModalSuccess = () => {
    fetchUsers(currentPage, 10, searchTerm);
  };

  return (
    <div className="space-y-6">
      <UsersPageHeader onCreateUser={() => setCreateModalOpen(true)} />
      
      {/* ✅ AFFICHAGE DES ERREURS : Utilise l'erreur du hook */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-800 hover:text-red-900 underline text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      
      <UsersStatsCards users={users} totalUsers={meta.total} />
      
      <UsersFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <UsersTable
        users={users}
        loading={loading}
        totalUsers={meta.total}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onManageDepartments={handleManageDepartments}
        onManageCels={handleManageCels}
      />

      <UsersModals
        createModalOpen={createModalOpen}
        editModalOpen={editModalOpen}
        deleteModalOpen={deleteModalOpen}
        departmentsModalOpen={departmentsModalOpen}
        celsModalOpen={celsModalOpen}
        selectedUser={selectedUser}
        onCreateModalChange={setCreateModalOpen}
        onEditModalChange={setEditModalOpen}
        onDeleteModalChange={setDeleteModalOpen}
        onDepartmentsModalChange={setDepartmentsModalOpen}
        onCelsModalChange={setCelsModalOpen}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
