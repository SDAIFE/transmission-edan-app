'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// ❌ SUPPRIMÉ : MultiSelect (plus utilisé dans ce modal)
import { Save, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi, rolesApi, type UpdateUserData, type User } from '@/lib/api';
import type { Role } from '@/types/auth';
// ❌ SUPPRIMÉ : SimpleDepartement, SimpleCel, Departement, Cel (gestion via endpoint séparé)

// Schéma de validation
// ❌ SUPPRIMÉ : departementCodes et celCodes (gérés via endpoint séparé)
const editUserSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  roleId: z.string().min(1, 'Veuillez sélectionner un rôle'),
  isActive: z.boolean(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

// Rôles par défaut (fallback si l'API échoue)
const defaultRoles: Role[] = [
  { id: '1', code: 'SADMIN', name: 'Super Administrateur' },
  { id: '2', code: 'ADMIN', name: 'Administrateur' },
  { id: '3', code: 'USER', name: 'Utilisateur' },
];

// ✅ Utilise le type User importé de @/lib/api

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [listsLoading, setListsLoading] = useState(false);
  // ❌ SUPPRIMÉ : departements et cels (gérés via endpoint séparé)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      isActive: true,
    },
  });

  // Charger les données de l'utilisateur quand la modale s'ouvre
  useEffect(() => {
    if (user && open) {
      setValue('email', user.email);
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('roleId', user.role.id);
      setValue('isActive', user.isActive);
      // ❌ SUPPRIMÉ : departementCodes et celCodes (gérés via endpoint séparé)
    }
  }, [user, open, setValue]);

  const onSubmit = async (formData: EditUserFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      // ❌ SUPPRIMÉ : departementCodes et celCodes (gérés via endpoint séparé)
      const userData: UpdateUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: formData.roleId,
        isActive: formData.isActive,
      };
      
      await usersApi.updateUser(user.id, userData);
      
      toast.success('Utilisateur modifié avec succès');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Erreur lors de la modification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification de l\'utilisateur';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les listes au montage du composant
  useEffect(() => {
    if (open) {
      loadLists();
    }
  }, [open]);

  const loadLists = async () => {
    try {
      setListsLoading(true);
      
      // ✅ Charger uniquement les rôles (départements et CELs gérés via endpoint séparé)
      const rolesList = await rolesApi.getRolesSimple().catch(() => {
        console.warn('⚠️ [EditUserModal] Impossible de charger les rôles, utilisation des rôles par défaut');
        return defaultRoles;
      });
      
      setRoles(rolesList);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des rôles:', error);
      toast.error('Erreur lors du chargement des rôles');
    } finally {
      setListsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier l&apos;utilisateur
          </DialogTitle>
          <DialogDescription>
            Modifier les informations de {user.firstName} {user.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Prénom"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Nom"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemple.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Rôle et statut */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleId">Rôle *</Label>
                <Select 
                  value={watch('roleId')} 
                  onValueChange={(value: string) => setValue('roleId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleId && (
                  <p className="text-sm text-red-600">{errors.roleId.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  title="Compte actif"
                  type="checkbox"
                  id="isActive"
                  checked={watch('isActive')}
                  onChange={(e) => setValue('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Compte actif</Label>
              </div>
            </div>
          </div>

          {/* ❌ SUPPRIMÉ : Sections départements et CELs (gérées via endpoint séparé) */}
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Les circonscriptions et CELs sont gérées séparément via le menu d'actions de l'utilisateur.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Modification...' : 'Modifier l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
