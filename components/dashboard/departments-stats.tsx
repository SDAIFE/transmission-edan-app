'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface DepartmentsStatsProps {
  publishedDepartments: number;
  unpublishedDepartments: number;
  totalDepartments: number;
}

export function DepartmentsStats({ 
  publishedDepartments, 
  unpublishedDepartments, 
  totalDepartments 
}: DepartmentsStatsProps) {
  const stats = [
    {
      label: 'Départements Publiés',
      value: publishedDepartments,
      icon: CheckCircle,
      color: 'text-green-600',
      subtitle: `${Math.round((publishedDepartments / totalDepartments) * 100)}% du total`
    },
    {
      label: 'Départements Non Publiés',
      value: unpublishedDepartments,
      icon: Clock,
      color: 'text-yellow-600',
      subtitle: `${Math.round((unpublishedDepartments / totalDepartments) * 100)}% du total`
    },
    {
      label: 'Total Départements',
      value: totalDepartments,
      icon: FileText,
      color: 'text-blue-600',
      subtitle: 'Tous départements confondus'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Statistiques des Départements</h2>
        <p className="text-muted-foreground">
          État de publication des départements
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
