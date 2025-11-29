"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select";
import { Save, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usersApi,
  listsApi,
  rolesApi,
  type CreateUserData,
  type SimpleCirconscription, // ✅ NOUVEAU : Utiliser SimpleCirconscription
} from "@/lib/api";
import type { Role } from "@/types/auth";
// ❌ SUPPRIMÉ : Departement et Cel (remplacés par SimpleCirconscription)

// Schéma de validation
const createUserSchema = z
  .object({
    email: z.string().email("Email invalide"),
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    roleId: z.string().min(1, "Veuillez sélectionner un rôle"),
    circonscriptionCodes: z.array(z.string()).optional(), // ✅ NOUVEAU : Utiliser circonscriptionCodes
    isActive: z.boolean(),
    // ❌ SUPPRIMÉ : celCodes (calculé automatiquement par le backend)
    // ❌ SUPPRIMÉ : departementCodes (remplacé par circonscriptionCodes)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;

// Rôles par défaut (fallback si l'API échoue)
const defaultRoles: Role[] = [
  { id: "1", code: "SADMIN", name: "Super Administrateur" },
  { id: "2", code: "ADMIN", name: "Administrateur" },
  { id: "3", code: "USER", name: "Utilisateur" },
];

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateUserModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [circonscriptions, setCirconscriptions] = useState<
    SimpleCirconscription[]
  >([]); // ✅ NOUVEAU : Utiliser SimpleCirconscription
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [listsLoading, setListsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ❌ SUPPRIMÉ : departements et cels (remplacés par circonscriptions)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      isActive: true,
      circonscriptionCodes: [], // ✅ NOUVEAU : Utiliser circonscriptionCodes
    },
  });

  const selectedCirconscriptions = watch("circonscriptionCodes") || []; // ✅ NOUVEAU

  // ✅ NOUVEAU : Convertir les circonscriptions en options pour MultiSelect
  const circonscriptionOptions: MultiSelectOption[] = circonscriptions.map(
    (circ) => ({
      value: circ.codCe,
      label: circ.libCe,
      description: circ.codCe,
    })
  );

  const onSubmit = async (formData: CreateUserFormData) => {
    try {
      setLoading(true);

      // Préparer les données pour l'API
      const userData: CreateUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        roleId: formData.roleId,
        circonscriptionCodes: formData.circonscriptionCodes || [], // ✅ NOUVEAU : Utiliser circonscriptionCodes
        isActive: formData.isActive,
        // ❌ SUPPRIMÉ : celCodes (calculé automatiquement par le backend)
      };

      if (process.env.NODE_ENV === "development") {
        console.warn("📋 [CreateUserModal] Données du formulaire:", formData);
        console.warn(
          "📤 [CreateUserModal] Données préparées pour l'API:",
          userData
        );
      }

      await usersApi.createUser(userData);

      if (process.env.NODE_ENV === "development") {
        console.warn(
          "✅ [CreateUserModal] Utilisateur créé avec succès, CELs incluses dans la création"
        );
      }

      toast.success("Utilisateur créé avec succès");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Erreur lors de la création:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'utilisateur";
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

      // ✅ NOUVEAU : Charger les rôles et circonscriptions en parallèle
      const [rolesList, { circonscriptions: circList }] = await Promise.all([
        rolesApi.getRolesSimple().catch(() => {
          console.warn(
            "⚠️ [CreateUserModal] Impossible de charger les rôles, utilisation des rôles par défaut"
          );
          return defaultRoles;
        }),
        listsApi.getFormLists(),
      ]);

      setRoles(rolesList);
      setCirconscriptions(circList); // ✅ NOUVEAU : Charger les circonscriptions
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des listes:", error);
      toast.error("Erreur lors du chargement des listes");
    } finally {
      setListsLoading(false);
    }
  };

  // ✅ NOUVEAU : Handler pour les circonscriptions
  const handleCirconscriptionChange = (selected: string[]) => {
    setValue("circonscriptionCodes", selected);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nouvel utilisateur
          </DialogTitle>
          <DialogDescription>
            Créer un nouveau compte utilisateur avec ses permissions et
            départements assignés.
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
                  {...register("firstName")}
                  placeholder="Prénom"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Nom"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@exemple.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sécurité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Mot de passe"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirmer le mot de passe"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rôle et statut */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleId">Rôle *</Label>
                <Select
                  onValueChange={(value: string) => setValue("roleId", value)}
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
                  <p className="text-sm text-red-600">
                    {errors.roleId.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  title="Compte actif"
                  type="checkbox"
                  id="isActive"
                  checked={watch("isActive")}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Compte actif</Label>
              </div>
            </div>
          </div>

          {/* ✅ NOUVEAU : Circonscriptions assignées */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">
                Circonscriptions assignées
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Les CELs seront automatiquement calculées par le système en
                fonction des circonscriptions sélectionnées.
              </p>
            </div>
            {listsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MultiSelect
                options={circonscriptionOptions}
                selected={selectedCirconscriptions}
                onChange={handleCirconscriptionChange}
                placeholder="Sélectionner des circonscriptions..."
                searchPlaceholder="Rechercher une circonscription..."
                emptyText="Aucune circonscription trouvée."
                maxDisplay={2}
              />
            )}
          </div>
          {/* ❌ SUPPRIMÉ : Section CELs (calculées automatiquement) */}

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
              {loading ? "Création..." : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
