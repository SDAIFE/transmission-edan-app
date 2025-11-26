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
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { Save, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi, listsApi, rolesApi, type UpdateUserData, type SimpleDepartement, type SimpleCel } from '@/lib/api';
import type { Role, Departement, Cel } from '@/types/auth';

// Schéma de validation
const editUserSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  roleId: z.string().min(1, 'Veuillez sélectionner un rôle'),
  departementCodes: z.array(z.string()).optional(),
  celCodes: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

// Rôles par défaut (fallback si l'API échoue)
const defaultRoles: Role[] = [
  { id: '1', code: 'SADMIN', name: 'Super Administrateur' },
  { id: '2', code: 'ADMIN', name: 'Administrateur' },
  { id: '3', code: 'USER', name: 'Utilisateur' },
];

interface User {
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
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [cels, setCels] = useState<Cel[]>([]);
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [listsLoading, setListsLoading] = useState(false);

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
      departementCodes: [],
    },
  });

  const selectedDepartements = watch('departementCodes') || [];
  const selectedCels = watch('celCodes') || [];

  // Convertir les données en options pour MultiSelect
  const departementOptions: MultiSelectOption[] = departements.map(dept => ({
    value: dept.codeDepartement,
    label: dept.libelleDepartement,
    description: dept.codeDepartement,
  }));

  const celOptions: MultiSelectOption[] = cels.map(cel => ({
    value: cel.codeCellule,
    label: cel.libelleCellule,
    description: cel.codeCellule,
  }));

  // Charger les données de l'utilisateur quand la modale s'ouvre
  useEffect(() => {
    if (user && open) {
      setValue('email', user.email);
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('roleId', user.role.id);
      setValue('isActive', user.isActive);
      setValue('departementCodes', user.departements.map(d => d.codeDepartement));
      setValue('celCodes', user.cellules ? user.cellules.map(c => c.codeCellule) : []);
    }
  }, [user, open, setValue]);

  const onSubmit = async (formData: EditUserFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      const userData: UpdateUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: formData.roleId,
        departementCodes: formData.departementCodes,
        celCodes: formData.celCodes,
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
      
      // Charger les rôles, départements et CELs en parallèle
      const [rolesList, { departements: deptList, cels: celsList }] = await Promise.all([
        rolesApi.getRolesSimple().catch(() => {
          console.warn('⚠️ [EditUserModal] Impossible de charger les rôles, utilisation des rôles par défaut');
          return defaultRoles;
        }),
        listsApi.getFormLists()
      ]);
      
      setRoles(rolesList);
      setDepartements(deptList);
      setCels(celsList);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des listes:', error);
      toast.error('Erreur lors du chargement des listes');
    } finally {
      setListsLoading(false);
    }
  };

  const handleDepartementChange = (selected: string[]) => {
    setValue('departementCodes', selected);
  };

  const handleCelChange = (selected: string[]) => {
    setValue('celCodes', selected);
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

          {/* Départements assignés */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Départements assignés</h3>
            {listsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MultiSelect
                options={departementOptions}
                selected={selectedDepartements}
                onChange={handleDepartementChange}
                placeholder="Sélectionner des départements..."
                searchPlaceholder="Rechercher un département..."
                emptyText="Aucun département trouvé."
                maxDisplay={2}
              />
            )}
          </div>

          {/* CELs assignées */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">CELs assignées</h3>
            {listsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MultiSelect
                options={celOptions}
                selected={selectedCels}
                onChange={handleCelChange}
                placeholder="Sélectionner des CELs..."
                searchPlaceholder="Rechercher une CEL..."
                emptyText="Aucune CEL trouvée."
                maxDisplay={2}
              />
            )}
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
