'use client';

import { Badge } from '@/components/ui/badge';
import type { UserResponseDto } from '@/types/auth';

interface DashboardHeaderProps {
  user: UserResponseDto;
  title: string;
}

export function DashboardHeader({ user, title }: DashboardHeaderProps) {
  const userRole = user?.role?.code;
  
  const getRoleDisplayName = (roleCode: string) => {
    switch (roleCode) {
      case 'USER':
        return 'Informaticien';
      case 'ADMIN':
        return 'Administrateur';
      case 'SADMIN':
        return 'Super Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleBadgeVariant = (roleCode: string) => {
    switch (roleCode) {
      case 'USER':
        return 'primary';
      case 'ADMIN':
        return 'default';
      case 'SADMIN':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-muted-foreground">
          {title} - {user?.email}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant={getRoleBadgeVariant(userRole)} 
          className="text-sm text-white"
        >
          {getRoleDisplayName(userRole)}
        </Badge>
      </div>
    </div>
  );
}
