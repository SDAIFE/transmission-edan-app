"use client";

import { TableCell, TableRow } from "@/components/ui/table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  MapPin, // ✅ NOUVEAU : Icône pour les circonscriptions
  Wifi,
  WifiOff,
} from "lucide-react";
import type { User } from "@/lib/api";

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onManageDepartments: (user: User) => void;
  onManageCels: (user: User) => void;
  onManageCirconscriptions: (user: User) => void; // ✅ NOUVEAU
}

export function UserTableRow({
  user,
  onEdit,
  onDelete,
  onManageDepartments,
  onManageCels,
  onManageCirconscriptions, // ✅ NOUVEAU
}: UserTableRowProps) {
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
      SADMIN: "Super Admin",
      ADMIN: "Admin",
      USER: "Utilisateur",
    };
    return roleNames[roleCode as keyof typeof roleNames] || roleCode;
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatLastConnection = (lastConnectionAt: string) => {
    if (!lastConnectionAt) return "Jamais";

    const date = new Date(lastConnectionAt);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440)
      return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${
      Math.floor(diffInMinutes / 1440) > 1 ? "s" : ""
    }`;
  };

  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>
              {getUserInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">ID: {user.id}</div>
          </div>
        </div>
      </TableCell>

      <TableCell>{user.email}</TableCell>

      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role.code)}>
          {getRoleDisplayName(user.role.code)}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {/* ✅ NOUVEAU : Infobulle avec liste complète des circonscriptions */}
          {user.circonscriptions && user.circonscriptions.length > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs cursor-help">
                  {user.circonscriptions.length} circonscription
                  {user.circonscriptions.length > 1 ? "s" : ""}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm" side="top">
                <div className="space-y-1">
                  <p className="font-semibold mb-2 text-sm">
                    Circonscriptions assignées :
                  </p>
                  <ul className="list-disc list-inside space-y-1 max-h-48 overflow-y-auto">
                    {user.circonscriptions.map((circ, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-medium">
                          {circ.LIB_CE || circ.COD_CE}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({circ.COD_CE})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge variant="outline" className="text-xs">
              Aucun
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {/* ✅ NOUVEAU : Infobulle avec liste complète des CELs */}
          {user.cellules && user.cellules.length > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs cursor-help">
                  {user.cellules.length} CEL
                  {user.cellules.length > 1 ? "s" : ""}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm" side="top">
                <div className="space-y-1">
                  <p className="font-semibold mb-2 text-sm">CELs assignées :</p>
                  <ul className="list-disc list-inside space-y-1 max-h-48 overflow-y-auto">
                    {user.cellules.map((cel, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-medium">
                          {cel.LIB_CEL || cel.COD_CEL}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({cel.COD_CEL})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : user.cellulesOld && user.cellulesOld.length > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs cursor-help">
                  {user.cellulesOld.length} CEL
                  {user.cellulesOld.length > 1 ? "s" : ""}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm" side="top">
                <div className="space-y-1">
                  <p className="font-semibold mb-2 text-sm">CELs assignées :</p>
                  <ul className="list-disc list-inside space-y-1 max-h-48 overflow-y-auto">
                    {user.cellulesOld.map((cel, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-medium">
                          {cel.libelleCellule}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({cel.codeCellule})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge variant="outline" className="text-xs">
              Aucune
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {/* ✅ PROTECTION : isConnected peut être undefined */}
          <div className="flex items-center gap-1">
            {user.isConnected === true ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={`text-sm ${
                user.isConnected === true ? "text-green-600" : "text-gray-500"
              }`}
            >
              {user.isConnected === true ? "Connecté" : "Hors ligne"}
            </span>
          </div>
          {/* ✅ PROTECTION : lastConnectionAt peut être undefined ou string */}
          {user.lastConnectionAt && (
            <div className="text-xs text-muted-foreground">
              {formatLastConnection(
                typeof user.lastConnectionAt === "string"
                  ? user.lastConnectionAt
                  : String(user.lastConnectionAt)
              )}
            </div>
          )}
          {/* ✅ AFFICHAGE : Afficher activeSession si disponible */}
          {user.activeSession && (
            <div className="text-xs text-muted-foreground">Session active</div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => onManageDepartments(user)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Départements
            </DropdownMenuItem> */}
            {/* ✅ NOUVEAU : Action pour gérer les circonscriptions */}
            <DropdownMenuItem onClick={() => onManageCirconscriptions(user)}>
              <MapPin className="mr-2 h-4 w-4" />
              Circonscriptions
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => onManageCels(user)}>
              <UserCheck className="mr-2 h-4 w-4" />
              CELs
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
