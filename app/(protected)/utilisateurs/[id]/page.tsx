"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MainLayout } from "@/components/layout/main-layout";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { DeleteUserModal } from "@/components/modals/delete-user-modal";
// import { ManageUserDepartmentsModal } from '@/components/modals/manage-user-departments-modal';
import { ManageUserCelsModal } from "@/components/modals/manage-user-cels-modal";
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  Calendar,
  Shield,
  MapPin,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usersApi, type User } from "@/lib/api";

// Interface User est maintenant importée depuis @/lib/api

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // États des modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // const [departmentsModalOpen, setDepartmentsModalOpen] = useState(false);
  const [celsModalOpen, setCelsModalOpen] = useState(false);

  const userId = params.id as string;

  // Vérifier les permissions
  const canManageUsers =
    currentUser?.role?.code === "SADMIN" || currentUser?.role?.code === "ADMIN";

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);

      const response: User = await usersApi.getUser(userId);
      setUser(response);
    } catch (error: unknown) {
      // console.error('Erreur lors du chargement de l\'utilisateur:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement de l'utilisateur";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated && canManageUsers && userId) {
      fetchUser();
    }
  }, [isAuthenticated, canManageUsers, userId, fetchUser]);

  const handleModalSuccess = () => {
    fetchUser();
  };

  const getRoleBadgeVariant = (roleCode: string) => {
    switch (roleCode) {
      case "SADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      case "USER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleDisplayName = (roleCode: string) => {
    const roleNames = {
      SADMIN: "Super Administrateur",
      ADMIN: "Administrateur",
      USER: "Utilisateur",
    };
    return roleNames[roleCode as keyof typeof roleNames] || roleCode;
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Non connecté</CardTitle>
            <CardDescription className="text-center">
              Vous devez être connecté pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Accès non autorisé</CardTitle>
            <CardDescription className="text-center">
              Vous n&apos;avez pas les permissions pour gérer les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Retour au Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              Utilisateur non trouvé
            </CardTitle>
            <CardDescription className="text-center">
              L&apos;utilisateur demandé n&apos;existe pas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/users">Retour à la liste</Link>
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground">
                Détails de l&apos;utilisateur
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            {/* <Button onClick={() => setDepartmentsModalOpen(true)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Départements
                </Button> */}
            <Button onClick={() => setCelsModalOpen(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              CELs
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profil utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations du profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src=""
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-muted-foreground">ID: {user.id}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Rôle</span>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role.code)}>
                      {getRoleDisplayName(user.role.code)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Statut</span>
                    </div>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Créé le</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Départements assignés */}
            {/* <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Départements assignés
                    </CardTitle>
                    <CardDescription>
                      {user.departements.length} département{user.departements.length > 1 ? 's' : ''} assigné{user.departements.length > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.departements.length > 0 ? (
                      <div className="space-y-3">
                        {user.departements.map((dept) => (
                          <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{dept.libelleDepartement}</p>
                              <p className="text-sm text-muted-foreground">
                                {dept.codeDepartement}
                              </p>
                            </div>
                            <Badge variant="outline">{dept.codeDepartement}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun département assigné</p>
                      </div>
                    )}
                  </CardContent>
                </Card> */}

            {/* CELs assignées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  CELs assignées
                </CardTitle>
                <CardDescription>
                  {user.cellules ? user.cellules.length : 0} CEL
                  {(user.cellules ? user.cellules.length : 0) > 1
                    ? "s"
                    : ""}{" "}
                  assignée
                  {(user.cellules ? user.cellules.length : 0) > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.cellules && user.cellules.length > 0 ? (
                  <div className="space-y-3">
                    {user.cellules.map((cel, index) => (
                      <div
                        key={cel.COD_CEL || index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {cel.LIB_CEL || cel.COD_CEL}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cel.COD_CEL}
                          </p>
                        </div>
                        <Badge variant="outline">{cel.COD_CEL}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune CEL assignée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informations secondaires */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setEditModalOpen(true)}
                  className="w-full justify-start"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier le profil
                </Button>
                {/* <Button onClick={() => setDepartmentsModalOpen(true)} variant="outline" className="w-full justify-start">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Gérer les départements
                    </Button> */}
                <Button
                  onClick={() => setCelsModalOpen(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Gérer les CELs
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer l&apos;utilisateur
                </Button>
              </CardContent>
            </Card>

            {/* Informations système */}
            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Créé le</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Dernière modification</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID utilisateur</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {user.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modales */}
        <EditUserModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          user={user}
          onSuccess={handleModalSuccess}
        />

        <DeleteUserModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          user={user}
          onSuccess={() => router.push("/users")}
        />

        {/* <ManageUserDepartmentsModal
              open={departmentsModalOpen}
              onOpenChange={setDepartmentsModalOpen}
              user={user}
              onSuccess={handleModalSuccess}
            /> */}

        <ManageUserCelsModal
          open={celsModalOpen}
          onOpenChange={setCelsModalOpen}
          user={user}
          onSuccess={handleModalSuccess}
        />
      </div>
    </MainLayout>
  );
}
