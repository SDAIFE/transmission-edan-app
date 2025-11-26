'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Building2, 
  Users, 
  Vote, 
  ChevronDown, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import type { PublishedZonesData, Region, Department, VotingPlace, PollingStation } from '@/lib/services/publishedZonesService';

interface ZoneNavigationProps {
  zones: PublishedZonesData | null;
  loading: boolean;
  error: string | null;
  onZoneSelect: (zone: {
    region: Region;
    department: Department;
    votingPlace: VotingPlace;
    pollingStation: PollingStation;
  }) => void;
  onRefresh: () => void;
}

export const ZoneNavigation: React.FC<ZoneNavigationProps> = ({ 
  zones, 
  loading, 
  error, 
  onZoneSelect,
  onRefresh 
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedVotingPlace, setSelectedVotingPlace] = useState<string>('');
  const [selectedPollingStation, setSelectedPollingStation] = useState<string>('');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Navigation par zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-red-600" />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={onRefresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!zones || zones.regions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            Aucune zone disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Aucune zone avec résultats publiés pour le moment.
            </p>
            <Button onClick={onRefresh} variant="outline">
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedRegionData = zones.regions.find(r => r.id === selectedRegion);
  const selectedDepartmentData = selectedRegionData?.departments.find(d => d.id === selectedDepartment);
  const selectedVotingPlaceData = selectedDepartmentData?.votingPlaces.find(vp => vp.id === selectedVotingPlace);

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedDepartment('');
    setSelectedVotingPlace('');
    setSelectedPollingStation('');
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedVotingPlace('');
    setSelectedPollingStation('');
  };

  const handleVotingPlaceChange = (votingPlaceId: string) => {
    setSelectedVotingPlace(votingPlaceId);
    setSelectedPollingStation('');
  };

  const handlePollingStationChange = (pollingStationId: string) => {
    setSelectedPollingStation(pollingStationId);
  };

  const handleZoneSelect = () => {
    if (!selectedRegion) return;

    const region = zones.regions.find(r => r.id === selectedRegion)!;
    
    // Construire la sélection en fonction des filtres actifs
    const selection: any = {
      region,
      department: null,
      votingPlace: null,
      pollingStation: null
    };

    if (selectedDepartment) {
      selection.department = region.departments.find(d => d.id === selectedDepartment)!;
      
      if (selectedVotingPlace) {
        selection.votingPlace = selection.department.votingPlaces.find((vp: VotingPlace) => vp.id === selectedVotingPlace)!;
        
        if (selectedPollingStation) {
          selection.pollingStation = selection.votingPlace.pollingStations.find((ps: PollingStation) => ps.id === selectedPollingStation)!;
        }
      }
    }

    onZoneSelect(selection);
  };

  const resetFilters = () => {
    setSelectedRegion('');
    setSelectedDepartment('');
    setSelectedVotingPlace('');
    setSelectedPollingStation('');
  };

  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Navigation hiérarchique */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Recherche par zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sélection Région */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Région
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Sélectionner une région"
              >
                <option value="">Sélectionner une région</option>
                {zones.regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection Département */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Département
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                disabled={!selectedRegion}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                aria-label="Sélectionner un département"
              >
                <option value="">Sélectionner un département</option>
                {selectedRegionData?.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection Lieu de vote */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lieu de vote
              </label>
              <select
                value={selectedVotingPlace}
                onChange={(e) => handleVotingPlaceChange(e.target.value)}
                disabled={!selectedDepartment}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                aria-label="Sélectionner un lieu de vote"
              >
                <option value="">Sélectionner un lieu</option>
                {selectedDepartmentData?.votingPlaces.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection Bureau de vote */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Vote className="h-4 w-4" />
                Bureau de vote
              </label>
              <select
                value={selectedPollingStation}
                onChange={(e) => handlePollingStationChange(e.target.value)}
                disabled={!selectedVotingPlace}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                aria-label="Sélectionner un bureau de vote"
              >
                <option value="">Sélectionner un bureau</option>
                {selectedVotingPlaceData?.pollingStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedRegion && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedRegionData?.name}
                  </Badge>
                  {selectedDepartment && (
                    <Badge variant="outline" className="text-xs">
                      {selectedDepartmentData?.name}
                    </Badge>
                  )}
                  {selectedVotingPlace && (
                    <Badge variant="outline" className="text-xs">
                      {selectedVotingPlaceData?.name}
                    </Badge>
                  )}
                  {selectedPollingStation && (
                    <Badge variant="outline" className="text-xs">
                      {selectedVotingPlaceData?.pollingStations.find(ps => ps.id === selectedPollingStation)?.name}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ChevronDown className="h-4 w-4 rotate-180" />
                Réinitialiser
              </Button>
              <Button
                onClick={handleZoneSelect}
                disabled={!selectedRegion}
                size="sm"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Voir les résultats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste compacte des zones */}
      {/* <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Zones disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {zones.regions.map((region) => (
              <div key={region.id} className="border border-gray-200 rounded-lg">
                <div 
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleRegion(region.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{region.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {region.departments.length} département{region.departments.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {region.departments.reduce((sum, dept) => 
                          sum + dept.votingPlaces.reduce((vpSum, vp) => vpSum + vp.pollingStations.length, 0), 0
                        )} bureaux
                      </span>
                      {expandedRegions.has(region.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedRegions.has(region.id) && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="space-y-3">
                      {region.departments.map((department) => (
                        <div key={department.id} className="border-l-2 border-blue-200 pl-4">
                          <div className="font-medium text-gray-800 mb-2">{department.name}</div>
                          <div className="space-y-2">
                            {department.votingPlaces.map((votingPlace) => (
                              <div key={votingPlace.id} className="ml-4">
                                <div className="text-sm font-medium text-gray-700 mb-1">
                                  {votingPlace.name}
                                </div>
                                <div className="space-y-1">
                                  {votingPlace.pollingStations.map((station) => (
                                    <div 
                                      key={station.id}
                                      className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                      onClick={() => {
                                        handleRegionChange(region.id);
                                        handleDepartmentChange(department.id);
                                        handleVotingPlaceChange(votingPlace.id);
                                        handlePollingStationChange(station.id);
                                      }}
                                    >
                                      {station.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};
