'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    code: string;
  };
}

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function DeleteUserModal({ open, onOpenChange, user, onSuccess }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      await usersApi.deleteUser(user.id);
      
      toast.success('Utilisateur supprimé avec succès');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isCurrentUser = false; // TODO: Vérifier si c'est l'utilisateur actuel
  const isSuperAdmin = user.role.code === 'SADMIN';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet utilisateur ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations de l'utilisateur */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Rôle: {user.role.code}
                </p>
              </div>
            </div>
          </div>

          {/* Avertissements */}
          {isCurrentUser && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Vous ne pouvez pas supprimer votre propre compte.
              </p>
            </div>
          )}

          {isSuperAdmin && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Attention : Vous supprimez un Super Administrateur. Cette action peut affecter l&apos;accès à certaines fonctionnalités.
              </p>
            </div>
          )}

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              🗑️ Toutes les données associées à cet utilisateur seront supprimées de manière permanente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading || isCurrentUser}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
