"use client";

import {
  BarChart3,
  Home,
  Upload,
  Users,
  ChevronLeft,
  ChevronRight,
  ChartBar,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/ui";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["USER", "ADMIN", "SADMIN"],
  },
  {
    title: "Importations",
    href: "/upload",
    icon: Upload,
    roles: ["USER", "ADMIN", "SADMIN"],
  },
  {
    title: "Publications",
    href: "/legislatives-publications",
    icon: BarChart3,
    roles: ["ADMIN", "SADMIN"],
  },
  {
    title: "Consolidation",
    href: "/legislatives-publications",
    icon: CheckSquare,
    roles: ["USER"],
  },
  {
    title: "Résultats",
    href: "/results",
    icon: ChartBar,
    roles: ["USER", "ADMIN", "SADMIN"],
  },
  {
    title: "Utilisateurs",
    href: "/utilisateurs",
    icon: Users,
    roles: ["ADMIN", "SADMIN"],
  },
  // {
  //   title: 'Rapports',
  //   href: '/rapports',
  //   icon: FileSpreadsheet,
  //   roles: ['USER', 'ADMIN', 'SADMIN'],
  // },
  // {
  //   title: 'Paramètres',
  //   href: '/settings',
  //   icon: Settings,
  //   roles: ['ADMIN', 'SADMIN'],
  // }
];

export function Sidebar() {
  // ✅ CORRECTION : Utilisation des bonnes propriétés du hook useSidebar()
  // Le hook retourne { isOpen, toggle, setOpen } et non { sidebarOpen, setSidebarOpen }
  const { isOpen: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const { user } = useAuth();
  const userRole = user?.role?.code;
  const pathname = usePathname();

  // ✅ FONCTION : Vérifie si l'utilisateur a au moins un des rôles requis
  // Permet de filtrer les éléments de navigation selon les permissions RBAC
  const hasAnyRole = (roles: string[]) => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  // ✅ FILTRAGE : Ne garde que les éléments de navigation accessibles à l'utilisateur
  // Basé sur le système RBAC (Role-Based Access Control)
  const filteredItems = navigationItems.filter((item) =>
    hasAnyRole(item.roles)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    sidebarOpen ? "px-3" : "px-2"
                  )}
                  size="sm"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {sidebarOpen && <span className="ml-2">Réduire</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
