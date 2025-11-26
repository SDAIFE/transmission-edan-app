'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { usersApi, type User, type UserListResponse } from '@/lib/api';
import { UsersPageHeader } from './users-page-header';
import { UsersStatsCards } from './users-stats-cards';
import { UsersFilters } from './users-filters';
import { UsersTable } from './users-table';
import { UsersModals } from './users-modals';

export function UsersPageContent() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // États des modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [departmentsModalOpen, setDepartmentsModalOpen] = useState(false);
  const [celsModalOpen, setCelsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Vérifier les permissions
  const canManageUsers = currentUser?.role?.code === 'SADMIN' || currentUser?.role?.code === 'ADMIN';

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const response: UserListResponse = await usersApi.getUsers({ 
        page: currentPage, 
        search: searchTerm 
      });
      
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (isAuthenticated && canManageUsers) {
      fetchUsers();
    }
  }, [isAuthenticated, canManageUsers, fetchUsers]);

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

  const handleModalSuccess = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <UsersPageHeader onCreateUser={() => setCreateModalOpen(true)} />
      
      <UsersStatsCards users={users} totalUsers={totalUsers} />
      
      <UsersFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <UsersTable
        users={users}
        loading={loading}
        totalUsers={totalUsers}
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
