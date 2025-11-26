'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin,
  Info
} from 'lucide-react';
import type { Region, ElectionResults } from '@/types/results';

// Import dynamique pour éviter les erreurs SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });

interface InteractiveMapProps {
  onRegionClick?: (region: Region) => void;
  electionData?: ElectionResults;
}

// Coordonnées approximatives des régions de Côte d'Ivoire
const regionCoordinates: Record<string, [number, number]> = {
  'Abidjan': [5.3600, -4.0083],
  'Yamoussoukro': [6.8276, -5.2893],
  'Bouaké': [7.6939, -5.0303],
  'San-Pédro': [4.7470, -6.6363],
  'Korhogo': [9.4580, -5.6296],
  'Man': [7.4051, -7.5563],
  'Gagnoa': [6.1289, -5.9506],
  'Daloa': [6.8774, -6.4502],
  'Bondoukou': [8.0402, -2.8000],
  'Abengourou': [6.7297, -3.4914]
};

// Frontières approximatives de la Côte d'Ivoire
const coteIvoireBounds: [number, number][] = [
  [4.0, -8.5],   // Sud-Ouest
  [4.5, -8.0],   // Sud-Ouest (côte)
  [5.0, -7.5],   // Sud
  [5.5, -7.0],   // Sud
  [6.0, -6.5],   // Sud
  [6.5, -6.0],   // Sud
  [7.0, -5.5],   // Centre-Sud
  [7.5, -5.0],   // Centre
  [8.0, -4.5],   // Centre
  [8.5, -4.0],   // Centre
  [9.0, -3.5],   // Centre-Nord
  [9.5, -3.0],   // Nord
  [10.0, -2.5],  // Nord-Est
  [10.5, -2.5],  // Nord-Est
  [10.5, -3.0],  // Nord-Est
  [10.0, -3.5],  // Nord
  [9.5, -4.0],   // Nord
  [9.0, -4.5],   // Nord
  [8.5, -5.0],   // Centre-Nord
  [8.0, -5.5],   // Centre
  [7.5, -6.0],   // Centre
  [7.0, -6.5],   // Centre-Sud
  [6.5, -7.0],   // Sud
  [6.0, -7.5],   // Sud
  [5.5, -8.0],   // Sud
  [5.0, -8.5],   // Sud-Ouest
  [4.0, -8.5]    // Sud-Ouest (retour)
];

export function InteractiveMap({ onRegionClick, electionData }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapView, setMapView] = useState<'results' | 'participation' | 'voters'>('results');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Si pas de données d'élection, afficher un message
  if (!electionData) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune donnée d'élection disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isClient) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRegionData = (region: Region) => {
    // Utiliser les données de la région directement depuis electionData
    const totalVotes = region.totals?.votants || 0;
    const totalInscrits = region.totals?.inscrits || 0;
    const participation = region.totals?.tauxParticipation || 0;
    
    // Trouver le candidat gagnant dans cette région
    const topResult = region.totals?.results?.sort((a, b) => b.votes - a.votes)[0];
    const candidate = electionData.candidates.find(c => c.id === topResult?.candidateId);

    return {
      candidate,
      totalVotes,
      totalInscrits,
      participation
    };
  };

  const getMarkerColor = (region: Region) => {
    const data = getRegionData(region);
    
    if (mapView === 'participation') {
      // Couleur basée sur le taux de participation
      if (data.participation >= 80) return '#10b981'; // Vert foncé - haute participation
      if (data.participation >= 60) return '#f59e0b'; // Orange - participation moyenne
      if (data.participation >= 40) return '#ef4444'; // Rouge - faible participation
      return '#6b7280'; // Gris - très faible participation
    }
    
    if (mapView === 'voters') {
      // Couleur basée sur le nombre de votants
      const maxVoters = Math.max(...electionData.regions.map(r => getRegionData(r).totalVotes));
      const intensity = data.totalVotes / maxVoters;
      if (intensity >= 0.8) return '#1e40af'; // Bleu foncé - beaucoup de votants
      if (intensity >= 0.6) return '#3b82f6'; // Bleu - votants moyens
      if (intensity >= 0.4) return '#60a5fa'; // Bleu clair - peu de votants
      return '#93c5fd'; // Bleu très clair - très peu de votants
    }
    
    // Mode résultats (par défaut) - couleur du candidat gagnant
    return data.candidate?.party.color || '#6B7280';
  };

  const getMarkerSize = (region: Region) => {
    const data = getRegionData(region);
    
    if (mapView === 'participation') {
      // Taille basée sur le taux de participation
      const baseSize = 8;
      const participationSize = (data.participation / 100) * 15; // Max 15px
      return Math.max(baseSize, participationSize);
    }
    
    if (mapView === 'voters') {
      // Taille basée sur le nombre de votants
      const maxVotes = Math.max(...electionData.regions.map(r => getRegionData(r).totalVotes));
      const baseSize = 6;
      const voterSize = (data.totalVotes / maxVotes) * 25; // Max 25px
      return Math.max(baseSize, voterSize);
    }
    
    // Mode résultats - taille basée sur le nombre de votes
    const maxVotes = Math.max(...electionData.regions.map(r => getRegionData(r).totalVotes));
    const baseSize = 8;
    const resultSize = (data.totalVotes / maxVotes) * 20; // Max 20px
    return Math.max(baseSize, resultSize);
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Légende et contrôles */}
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20 max-w-xs">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              {mapView === 'results' && <BarChart3 className="h-4 w-4" />}
              {mapView === 'participation' && <TrendingUp className="h-4 w-4" />}
              {mapView === 'voters' && <Users className="h-4 w-4" />}
              {mapView === 'results' && 'Légende des résultats'}
              {mapView === 'participation' && 'Légende de participation'}
              {mapView === 'voters' && 'Légende des votants'}
            </h3>
            <div className="space-y-2">
              {mapView === 'results' && electionData.candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-2 group cursor-pointer">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: candidate.party.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {candidate.fullName}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({candidate.party.sigle})
                  </span>
                </div>
              ))}
              
              {mapView === 'participation' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#10b981' }} />
                    <span className="text-sm font-medium text-gray-700">Haute participation (≥80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#f59e0b' }} />
                    <span className="text-sm font-medium text-gray-700">Participation moyenne (60-79%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#ef4444' }} />
                    <span className="text-sm font-medium text-gray-700">Faible participation (40-59%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#6b7280' }} />
                    <span className="text-sm font-medium text-gray-700">Très faible participation (&lt;40%)</span>
                  </div>
                </div>
              )}
              
              {mapView === 'voters' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#1e40af' }} />
                    <span className="text-sm font-medium text-gray-700">Beaucoup de votants (≥80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#3b82f6' }} />
                    <span className="text-sm font-medium text-gray-700">Votants moyens (60-79%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#60a5fa' }} />
                    <span className="text-sm font-medium text-gray-700">Peu de votants (40-59%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: '#93c5fd' }} />
                    <span className="text-sm font-medium text-gray-700">Très peu de votants (&lt;40%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contrôles de vue */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20">
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                variant={mapView === 'results' ? 'default' : 'outline'} 
                className="text-xs justify-start"
                onClick={() => setMapView('results')}
              >
                <BarChart3 className="h-3 w-3 mr-2" />
                Résultats
              </Button>
              <Button 
                size="sm" 
                variant={mapView === 'participation' ? 'default' : 'outline'} 
                className="text-xs justify-start"
                onClick={() => setMapView('participation')}
              >
                <TrendingUp className="h-3 w-3 mr-2" />
                Participation
              </Button>
              <Button 
                size="sm" 
                variant={mapView === 'voters' ? 'default' : 'outline'} 
                className="text-xs justify-start"
                onClick={() => setMapView('voters')}
              >
                <Users className="h-3 w-3 mr-2" />
                Votants
              </Button>
            </div>
          </div>

          {/* Carte Leaflet */}
          <div className="h-[600px] w-full">
            <MapContainer
              center={[7.5400, -5.5471]} // Centre de la Côte d'Ivoire
              zoom={7}
              minZoom={6}
              maxZoom={10}
              maxBounds={[
                [4.0, -8.5], // Sud-Ouest
                [10.5, -2.5]  // Nord-Est
              ]}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Frontières de la Côte d'Ivoire */}
              {/* <Polygon
                positions={coteIvoireBounds}
                pathOptions={{
                  fillColor: 'transparent',
                  color: '#1e40af',
                  weight: 3,
                  opacity: 0.8,
                  fillOpacity: 0.1
                }}
              /> */}
              
              {electionData.regions.map((region) => {
                const coords = regionCoordinates[region.nom];
                if (!coords) return null;

                const data = getRegionData(region);
                const color = getMarkerColor(region);
                const size = getMarkerSize(region);

                return (
                  <CircleMarker
                    key={region.id}
                    center={coords}
                    radius={size}
                    pathOptions={{
                      fillColor: color,
                      color: color,
                      weight: 2,
                      opacity: 0.8,
                      fillOpacity: 0.6
                    }}
                    eventHandlers={{
                      click: () => onRegionClick?.(region)
                    }}
                  >
                    <Popup>
                      <div className="p-3 min-w-[250px]">
                        <h3 className="font-bold text-lg mb-3 text-center">{region.nom}</h3>
                        
                        {mapView === 'results' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm font-medium">
                                {data.candidate?.fullName || 'Aucun candidat'}
                              </span>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold" style={{ color: data.candidate?.party.color }}>
                                {data.participation.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-600">du candidat gagnant</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold">{data.totalVotes.toLocaleString('fr-FR')}</div>
                                <div className="text-gray-600">Votes</div>
                              </div>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold">{data.totalInscrits.toLocaleString('fr-FR')}</div>
                                <div className="text-gray-600">Inscrits</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {mapView === 'participation' && (
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-3xl font-bold" style={{ color: color }}>
                                {data.participation.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Taux de participation</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold">{data.totalVotes.toLocaleString('fr-FR')}</div>
                                <div className="text-gray-600">Votants</div>
                              </div>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold">{data.totalInscrits.toLocaleString('fr-FR')}</div>
                                <div className="text-gray-600">Inscrits</div>
                              </div>
                            </div>
                            <div className="text-xs text-center text-gray-500">
                              {data.participation >= 80 && "Excellente participation"}
                              {data.participation >= 60 && data.participation < 80 && "Bonne participation"}
                              {data.participation >= 40 && data.participation < 60 && "Participation faible"}
                              {data.participation < 40 && "Participation très faible"}
                            </div>
                          </div>
                        )}
                        
                        {mapView === 'voters' && (
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-3xl font-bold" style={{ color: color }}>
                                {data.totalVotes.toLocaleString('fr-FR')}
                              </div>
                              <div className="text-sm text-gray-600">Nombre de votants</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold">{data.participation.toFixed(1)}%</div>
                                <div className="text-gray-600">Participation</div>
                              </div>
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold">{data.totalInscrits.toLocaleString('fr-FR')}</div>
                                <div className="text-gray-600">Inscrits</div>
                              </div>
                            </div>
                            <div className="text-xs text-center text-gray-500">
                              {data.candidate?.fullName && `Gagnant: ${data.candidate.fullName}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Statistiques globales */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20">
            <h4 className="font-bold text-gray-900 mb-2 text-sm">
              {mapView === 'results' && 'Résultats globaux'}
              {mapView === 'participation' && 'Participation globale'}
              {mapView === 'voters' && 'Votants globaux'}
            </h4>
            <div className="space-y-1 text-xs">
              {mapView === 'results' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total votes:</span>
                    <span className="font-semibold">
                      {electionData.regions
                        .reduce((acc, r) => acc + getRegionData(r).totalVotes, 0)
                        .toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Candidat gagnant:</span>
                    <span className="font-semibold">
                      {electionData.candidates.find(c => c.results.isWinner)?.fullName || 'N/A'}
                    </span>
                  </div>
                </>
              )}
              
              {mapView === 'participation' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participation moyenne:</span>
                    <span className="font-semibold">
                      {(electionData.regions
                        .reduce((acc, r) => acc + getRegionData(r).participation, 0) / electionData.regions.length)
                        .toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Régions avec haute participation:</span>
                    <span className="font-semibold">
                      {electionData.regions
                        .filter(r => getRegionData(r).participation >= 80).length}
                    </span>
                  </div>
                </>
              )}
              
              {mapView === 'voters' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total votants:</span>
                    <span className="font-semibold">
                      {electionData.regions
                        .reduce((acc, r) => acc + getRegionData(r).totalVotes, 0)
                        .toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total inscrits:</span>
                    <span className="font-semibold">
                      {electionData.regions
                        .reduce((acc, r) => acc + getRegionData(r).totalInscrits, 0)
                        .toLocaleString('fr-FR')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-blue-600/90 text-white rounded-lg p-3 text-xs max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-3 w-3" />
              <span className="font-semibold">Instructions</span>
            </div>
            <p>Cliquez sur les marqueurs pour voir les détails. Utilisez les boutons pour changer de vue.</p>
          </div>

          {/* Indicateur de zone */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-white/20">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Côte d&apos;Ivoire - Résultats électoraux</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
