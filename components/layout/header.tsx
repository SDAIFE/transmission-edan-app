"use client";

import { Menu, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/store/ui";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Header() {
  // ✅ CORRECTION : useSidebar retourne { isOpen, toggle, setOpen }
  const { toggle } = useSidebar();
  // ✅ CORRECTION : Point-virgule au lieu de deux-points
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Ne pas afficher le header sur la page d'accueil si l'utilisateur n'est pas connecté
  const isHomePage = pathname === "/";
  const shouldShowSidebarToggle = !isHomePage;

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return "Utilisateur";
    return `${user.firstName} ${user.lastName}`;
  };

  const getRoleDisplayName = () => {
    if (!user?.role) return "Utilisateur";

    const roleNames = {
      USER: "Utilisateur",
      ADMIN: "Administrateur",
      SADMIN: "Super Administrateur",
    };

    return roleNames[user.role.code as keyof typeof roleNames] || "Utilisateur";
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {shouldShowSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {/* Logo CEI */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logos/logocei2.webp"
              alt="CEI"
              width={32}
              height={32}
            />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg">
                TRECIV-Expert | EDAN 2025 - Système Expert de Traitement des
                Résultats des Elections en Côte d’Ivoire
              </h1>
              <p className="text-sm text-green-600">
                Commission Électorale Indépendante - Élection Législatives
                2025
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={getUserDisplayName()} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs mt-1">
                    {getRoleDisplayName()}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
