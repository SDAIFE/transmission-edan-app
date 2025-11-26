'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2, Users, Vote } from 'lucide-react';
import type { PublishedZonesData } from '@/lib/services/publishedZonesService';

interface ZoneStatsProps {
  zones: PublishedZonesData | null;
  loading: boolean;
}

export const ZoneStats: React.FC<ZoneStatsProps> = ({ zones, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!zones) {
    return null;
  }

  // Calculer les statistiques
  const totalRegions = zones.regions.length;
  const totalDepartments = zones.regions.reduce((sum, region) => sum + region.departments.length, 0);
  const totalVotingPlaces = zones.regions.reduce((sum, region) => 
    sum + region.departments.reduce((deptSum, dept) => deptSum + dept.votingPlaces.length, 0), 0
  );
  const totalPollingStations = zones.regions.reduce((sum, region) => 
    sum + region.departments.reduce((deptSum, dept) => 
      deptSum + dept.votingPlaces.reduce((vpSum, vp) => vpSum + vp.pollingStations.length, 0), 0
    ), 0
  );

  const stats = [
    {
      title: 'Régions',
      value: totalRegions,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Départements',
      value: totalDepartments,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Lieux de vote',
      value: totalVotingPlaces,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Bureaux de vote',
      value: totalPollingStations,
      icon: Vote,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString('fr-FR')}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
