'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserTableRow } from './user-table-row';
import type { User } from '@/lib/api';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  totalUsers: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onManageDepartments: (user: User) => void;
  onManageCels: (user: User) => void;
}

export function UsersTable({ 
  users, 
  loading, 
  totalUsers, 
  onEdit, 
  onDelete, 
  onManageDepartments, 
  onManageCels 
}: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des utilisateurs</CardTitle>
        <CardDescription>
          {totalUsers} utilisateur{totalUsers > 1 ? 's' : ''} au total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Départements</TableHead>
                <TableHead>CELs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onManageDepartments={onManageDepartments}
                  onManageCels={onManageCels}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
