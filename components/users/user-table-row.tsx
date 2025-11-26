'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { User } from '@/lib/api';

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onManageDepartments: (user: User) => void;
  onManageCels: (user: User) => void;
}

export function UserTableRow({ 
  user, 
  onEdit, 
  onDelete, 
  onManageDepartments, 
  onManageCels 
}: UserTableRowProps) {
  const getRoleBadgeVariant = (roleCode: string) => {
    switch (roleCode) {
      case 'SADMIN':
        return 'destructive';
      case 'ADMIN':
        return 'default';
      case 'USER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (roleCode: string) => {
    const roleNames = {
      SADMIN: 'Super Admin',
      ADMIN: 'Admin',
      USER: 'Utilisateur',
    };
    return roleNames[roleCode as keyof typeof roleNames] || roleCode;
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatLastConnection = (lastConnectionAt: string) => {
    if (!lastConnectionAt) return 'Jamais';
    
    const date = new Date(lastConnectionAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
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
            <div className="text-sm text-muted-foreground">
              ID: {user.id}
            </div>
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
          <Badge variant="outline" className="text-xs">
            {user.departements.length} département{user.departements.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {user.cellules ? user.cellules.length : 0} CEL{(user.cellules ? user.cellules.length : 0) > 1 ? 's' : ''}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? 'default' : 'secondary'}>
            {user.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {user.isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span className={`text-sm ${user.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {user.isConnected ? 'Connecté' : 'Hors ligne'}
            </span>
          </div>
          {user.lastConnectionAt && (
            <div className="text-xs text-muted-foreground">
              {formatLastConnection(user.lastConnectionAt)}
            </div>
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
            <DropdownMenuItem onClick={() => onManageDepartments(user)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Départements
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageCels(user)}>
              <UserCheck className="mr-2 h-4 w-4" />
              CELs
            </DropdownMenuItem>
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
