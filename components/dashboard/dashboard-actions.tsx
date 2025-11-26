'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Map, 
  Users,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import type { UserResponseDto } from '@/types/auth';

interface DashboardActionsProps {
  user: UserResponseDto;
}

export function DashboardActions({ user }: DashboardActionsProps) {
  const userRole = user?.role?.code;

  // Actions communes à tous les rôles
  const commonActions = [
    {
      title: 'Importations',
      description: 'Importer des fichiers Excel',
      icon: Upload,
      href: '/upload',
      iconColor: 'text-blue-600',
      iconSize: 'h-6 w-6'
    },
    {
      title: 'Résultats',
      description: 'Consulter les résultats électoraux',
      icon: Map,
      href: '/results',
      iconColor: 'text-green-600',
      iconSize: 'h-6 w-6'
    }
  ];

  // Actions spécifiques selon le rôle
  const getRoleSpecificActions = () => {
    if (userRole === 'USER') {
      return [
        {
          title: 'Consolidation',
          description: 'Consolider les données des départements',
          icon: CheckSquare,
          href: '/consolidation',
          iconColor: 'text-purple-600',
          iconSize: 'h-6 w-6'
        }
      ];
    } else if (userRole === 'ADMIN' || userRole === 'SADMIN') {
      return [
        {
          title: 'Publications',
          description: 'Publier les résultats des départements',
          icon: FileText,
          href: '/publications',
          iconColor: 'text-orange-600',
          iconSize: 'h-6 w-6'
        },
        {
          title: 'Utilisateurs',
          description: 'Gérer les utilisateurs du système',
          icon: Users,
          href: '/users',
          iconColor: 'text-red-600',
          iconSize: 'h-6 w-6'
        },
        // {
        //   title: 'Rapports',
        //   description: 'Consulter les rapports électoraux',
        //   icon: BarChart3,
        //   href: '/rapports',
        //   iconColor: 'text-indigo-600',
        //   iconSize: 'h-6 w-6'
        // }
      ];
    }
    return [];
  };

  const allActions = [...commonActions, ...getRoleSpecificActions()];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`${action.iconColor} ${action.iconSize}`} />
                {action.title}
              </CardTitle>
              <CardDescription>
                {action.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={action.href}>
                  {action.title === 'Importations' && 'Importer des données'}
                  {action.title === 'Publications' && 'Gérer les publications'}
                  {action.title === 'Consolidation' && 'Consolider les données'}
                  {action.title === 'Résultats' && 'Voir les résultats'}
                  {action.title === 'Utilisateurs' && 'Gérer les utilisateurs'}
                  {action.title === 'Rapports' && 'Voir les rapports'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
