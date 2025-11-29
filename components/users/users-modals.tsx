"use client";

import { CreateUserModal } from "@/components/modals/create-user-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { DeleteUserModal } from "@/components/modals/delete-user-modal";
import { ManageUserDepartmentsModal } from "@/components/modals/manage-user-departments-modal";
import { ManageUserCelsModal } from "@/components/modals/manage-user-cels-modal";
import { ManageUserCirconscriptionsModal } from "@/components/modals/manage-user-circonscriptions-modal"; // ✅ NOUVEAU
import type { User } from "@/lib/api";

interface UsersModalsProps {
  // États des modales
  createModalOpen: boolean;
  editModalOpen: boolean;
  deleteModalOpen: boolean;
  departmentsModalOpen: boolean;
  celsModalOpen: boolean;
  circonscriptionsModalOpen: boolean; // ✅ NOUVEAU

  // Utilisateur sélectionné
  selectedUser: User | null;

  // Handlers d'ouverture/fermeture
  onCreateModalChange: (open: boolean) => void;
  onEditModalChange: (open: boolean) => void;
  onDeleteModalChange: (open: boolean) => void;
  onDepartmentsModalChange: (open: boolean) => void;
  onCelsModalChange: (open: boolean) => void;
  onCirconscriptionsModalChange: (open: boolean) => void; // ✅ NOUVEAU

  // Handler de succès
  onSuccess: () => void;
}

export function UsersModals({
  createModalOpen,
  editModalOpen,
  deleteModalOpen,
  departmentsModalOpen,
  celsModalOpen,
  circonscriptionsModalOpen, // ✅ NOUVEAU
  selectedUser,
  onCreateModalChange,
  onEditModalChange,
  onDeleteModalChange,
  onDepartmentsModalChange,
  onCelsModalChange,
  onCirconscriptionsModalChange, // ✅ NOUVEAU
  onSuccess,
}: UsersModalsProps) {
  return (
    <>
      <CreateUserModal
        open={createModalOpen}
        onOpenChange={onCreateModalChange}
        onSuccess={onSuccess}
      />

      <EditUserModal
        open={editModalOpen}
        onOpenChange={onEditModalChange}
        user={selectedUser}
        onSuccess={onSuccess}
      />

      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={onDeleteModalChange}
        user={selectedUser}
        onSuccess={onSuccess}
      />

      <ManageUserDepartmentsModal
        open={departmentsModalOpen}
        onOpenChange={onDepartmentsModalChange}
        user={selectedUser}
        onSuccess={onSuccess}
      />

      <ManageUserCelsModal
        open={celsModalOpen}
        onOpenChange={onCelsModalChange}
        user={selectedUser}
        onSuccess={onSuccess}
      />

      {/* ✅ NOUVEAU : Modal de gestion des circonscriptions */}
      <ManageUserCirconscriptionsModal
        open={circonscriptionsModalOpen}
        onOpenChange={onCirconscriptionsModalChange}
        user={selectedUser}
        onSuccess={onSuccess}
      />
    </>
  );
}
