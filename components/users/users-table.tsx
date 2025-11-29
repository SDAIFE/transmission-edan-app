"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserTableRow } from "./user-table-row";
import type { User } from "@/lib/api";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  totalUsers: number;
  currentPage?: number; // ✅ NOUVEAU : Page courante
  totalPages?: number; // ✅ NOUVEAU : Nombre total de pages
  onPageChange?: (page: number) => void; // ✅ NOUVEAU : Handler pour changer de page
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onManageDepartments: (user: User) => void;
  onManageCels: (user: User) => void;
  onManageCirconscriptions: (user: User) => void; // ✅ NOUVEAU
}

export function UsersTable({
  users,
  loading,
  totalUsers,
  currentPage = 1, // ✅ NOUVEAU : Page courante (défaut: 1)
  totalPages = 1, // ✅ NOUVEAU : Nombre total de pages (défaut: 1)
  onPageChange, // ✅ NOUVEAU : Handler pour changer de page
  onEdit,
  onDelete,
  onManageDepartments,
  onManageCels,
  onManageCirconscriptions, // ✅ NOUVEAU
}: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des utilisateurs</CardTitle>
        <CardDescription>
          {totalUsers} utilisateur{totalUsers > 1 ? "s" : ""} au total
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
                <TableHead>Circonscriptions</TableHead>
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
                  onManageCirconscriptions={onManageCirconscriptions} // ✅ NOUVEAU
                />
              ))}
            </TableBody>
          </Table>
        )}

        {/* ✅ NOUVEAU : Contrôles de pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Affichage de <span className="font-medium">{users.length}</span>{" "}
              sur <span className="font-medium">{totalUsers}</span> utilisateur
              {totalUsers > 1 ? "s" : ""}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
