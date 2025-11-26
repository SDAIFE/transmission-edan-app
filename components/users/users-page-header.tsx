'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface UsersPageHeaderProps {
  onCreateUser: () => void;
}

export function UsersPageHeader({ onCreateUser }: UsersPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">
          Administrer les comptes utilisateurs et leurs permissions
        </p>
      </div>
      <Button onClick={onCreateUser}>
        <Plus className="mr-2 h-4 w-4" />
        Nouvel utilisateur
      </Button>
    </div>
  );
}
