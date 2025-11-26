'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import type { DepartmentStats, PublicationsStatsCardProps } from '@/types/publications';

interface PublicationsStatsCardsProps {
  stats: DepartmentStats | null;
  loading?: boolean;
}

export function PublicationsStatsCards({ stats, loading = false }: PublicationsStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Aucune donnée</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards: PublicationsStatsCardProps[] = [
    {
      title: 'Total Départements',
      value: stats.totalDepartments,
      icon: <Building2 className="h-4 w-4 text-blue-600" />,
      color: 'default'
    },
    {
      title: 'Publiés',
      value: stats.publishedDepartments,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: 'success',
      trend: {
        value: stats.publicationRate,
        isPositive: true
      }
    },
    {
      title: 'En Attente',
      value: stats.pendingDepartments,
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      color: 'warning'
    },
    {
      title: 'Total CELs',
      value: stats.totalCels,
      icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
      color: 'default'
    },
    {
      title: 'CELs Importées',
      value: stats.importedCels,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: 'success'
    },
    {
      title: 'CELs en Attente',
      value: stats.pendingCels,
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      color: 'warning'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <PublicationsStatsCard key={index} {...card} />
      ))}
    </div>
  );
}

function PublicationsStatsCard({ 
  title, 
  value, 
  icon, 
  color = 'default', 
  trend 
}: PublicationsStatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span>{trend.value}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
