'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { CandidateCard } from './candidate-card';
import { CandidateCardSkeleton } from './candidate-card-skeleton';
import { CandidatesSectionSkeleton } from './candidates-section-skeleton';
import { ChartSkeleton } from './chart-skeleton';
import { ChartsSectionSkeleton } from './charts-section-skeleton';
import { FiltersSkeleton } from './filters-skeleton';
import { NavigationSkeleton } from './navigation-skeleton';
import { OverviewPageSkeleton } from './overview-page-skeleton';
import { OverviewViewSkeleton } from './overview-view-skeleton';
import { ResultsPageCompleteSkeleton } from './results-page-complete-skeleton';
import { ResultsPageFinalSkeleton } from './results-page-final-skeleton';
import { ResultsPageFullSkeleton } from './results-page-full-skeleton';
import { ResultsPageSkeleton } from './results-page-skeleton';
import { ResultsPageTotalSkeleton } from './results-page-total-skeleton';
import { ResultsPageUltimateSkeleton } from './results-page-ultimate-skeleton';
import { ResultsTableSkeleton } from './results-table-skeleton';
import { TablePageSkeleton } from './table-page-skeleton';
import { TableViewSkeleton } from './table-view-skeleton';
import { ViewsNavigationSkeleton } from './views-navigation-skeleton';
import { ResultsChart } from './results-chart';
import { ResultsTable } from './results-table';
import { ZoneStats } from './zone-stats';
import { ZoneNavigation } from './zone-navigation';
import { ZoneResultsDisplay } from './zone-results-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  Table, 
  Map,
  Eye,
  TrendingUp,
  Users,
  Vote,
  Loader2,
  AlertCircle,
  Download,
  Filter,
  ChevronDown,
  MapPin,
  Building2,
  Search
} from 'lucide-react';
import { useCandidatesDetailed } from '@/hooks/use-candidates-detailed';
import { usePublishedZones } from '@/hooks/use-published-zones';
import { useZoneResults } from '@/hooks/use-zone-results';
import { useAuth } from '@/contexts/AuthContext';
import type { Candidate, ResultsFilters, Region, PublishedZonesData } from '@/types/results';

export function ResultsPageContent() {
  const [selectedView, setSelectedView] = useState<'overview' | 'table' | 'map'>('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedZone, setSelectedZone] = useState<{
    region: any;
    department: any;
    votingPlace: any;
    pollingStation: any;
  } | null>(null);
  
  // Contexte d'authentification pour gérer les erreurs de session
  const { isAuthenticated, refreshAuth } = useAuth();
  
  // États pour les filtres de la vue tableau
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');
  const [selectedVotingPlaceFilter, setSelectedVotingPlaceFilter] = useState<string>('');
  const [selectedPollingStationFilter, setSelectedPollingStationFilter] = useState<string>('');
  
  // Refs pour les graphiques
  const donutChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  
  // Utiliser le nouveau hook pour récupérer les données des candidats détaillés
  const { 
    candidates, 
    colors,
    electionInfo,
    loading, 
    error, 
    refresh 
  } = useCandidatesDetailed('election-2025');

  // Utiliser le hook pour récupérer les zones publiées
  const { 
    zones: publishedZones,
    loading: zonesLoading,
    error: zonesError,
    refresh: refreshZones
  } = usePublishedZones('election-2025');

  // Utiliser le hook pour récupérer les résultats de la zone sélectionnée
  const zoneResultsParams = useMemo(() => {
    if (!selectedZone) return {};
    
    const params: any = {
      regionId: selectedZone.region.id
    };
    
    if (selectedZone.department) {
      params.departmentId = selectedZone.department.id;
      
      if (selectedZone.votingPlace) {
        params.votingPlaceId = selectedZone.votingPlace.id;
        
        if (selectedZone.pollingStation) {
          params.pollingStationId = selectedZone.pollingStation.id;
        }
      }
    }
    
    return params;
  }, [selectedZone]);

  const { 
    results: zoneResults,
    loading: zoneResultsLoading,
    error: zoneResultsError,
    refresh: refreshZoneResults
  } = useZoneResults('election-2025', zoneResultsParams);

  // Fonction pour obtenir la couleur d'un candidat basée sur son rang
  const getCandidateColor = useCallback((candidate: Candidate) => {
    if (!colors || colors.length === 0) {
      return candidate.party.color; // Fallback vers la couleur du parti
    }
    
    // Vérifier que le candidat a des résultats valides
    if (!candidate.results || typeof candidate.results.rank !== 'number') {
      return candidate.party.color;
    }
    
    // Utiliser le rang pour déterminer la couleur (rang 1 = index 0, etc.)
    const colorIndex = candidate.results.rank - 1;
    return colors[colorIndex] || candidate.party.color;
  }, [colors]);

  // Trier les candidats par numéro d'ordre (mémorisé pour éviter les recalculs)
  const sortedCandidates = useMemo(() => {
    if (!candidates || candidates.length === 0) {
      return [];
    }
    
    // Log pour débogage
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Debug] Candidats reçus:', candidates);
      console.log('🔍 [Debug] Premier candidat:', candidates[0]);
    }
    
    // Filtrer les candidats qui ont des résultats valides OU utiliser tous les candidats si pas de résultats
    const validCandidates = candidates.filter(c => {
      // Si le candidat a des résultats, vérifier qu'ils sont valides
      if (c.results) {
        return typeof c.results.votes === 'number';
      }
      // Sinon, inclure le candidat quand même (pour l'affichage de base)
      return true;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Debug] Candidats valides:', validCandidates.length);
    }
    
    return validCandidates.sort((a, b) => a.numero - b.numero);
  }, [candidates]);

  const views = [
    { id: 'overview', label: 'Résultats par candidat', icon: Eye },
    { id: 'table', label: 'Tableau détaillé', icon: Table },
    // { id: 'map', label: 'Cartographie', icon: Map }
  ];

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(selectedCandidate?.id === candidate.id ? null : candidate);
  };

  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);
  };

  const handleZoneSelect = (zone: {
    region: any;
    department: any;
    votingPlace: any;
    pollingStation: any;
  }) => {
    setSelectedZone(zone);
    if (process.env.NODE_ENV === 'development') {
      console.log('🗺️ [ResultsPageContent] Zone sélectionnée:', zone);
      console.log('🔍 [ResultsPageContent] Paramètres qui seront envoyés:', {
        regionId: zone.region?.id,
        departmentId: zone.department?.id,
        votingPlaceId: zone.votingPlace?.id,
        pollingStationId: zone.pollingStation?.id
      });
    }
  };

  // Fonctions pour obtenir les données des zones publiées
  const getRegions = () => {
    return publishedZones?.regions || [];
  };

  const getDepartments = (regionId: string) => {
    const region = publishedZones?.regions.find(r => r.id === regionId);
    return region?.departments || [];
  };

  const getVotingPlaces = (departmentId: string) => {
    for (const region of publishedZones?.regions || []) {
      const department = region.departments.find(d => d.id === departmentId);
      if (department) {
        return department.votingPlaces;
      }
    }
    return [];
  };

  const getPollingStations = (votingPlaceId: string) => {
    for (const region of publishedZones?.regions || []) {
      for (const department of region.departments) {
        const votingPlace = department.votingPlaces.find(vp => vp.id === votingPlaceId);
        if (votingPlace) {
          return votingPlace.pollingStations;
        }
      }
    }
    return [];
  };

  // Fonctions de gestion des filtres
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionFilter(regionId);
    setSelectedDepartmentFilter('');
    setSelectedVotingPlaceFilter('');
    setSelectedPollingStationFilter('');
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentFilter(departmentId);
    setSelectedVotingPlaceFilter('');
    setSelectedPollingStationFilter('');
  };

  const handleVotingPlaceChange = (votingPlaceId: string) => {
    setSelectedVotingPlaceFilter(votingPlaceId);
    setSelectedPollingStationFilter('');
  };

  const handlePollingStationChange = (pollingStationId: string) => {
    setSelectedPollingStationFilter(pollingStationId);
  };

  const resetFilters = () => {
    setSelectedRegionFilter('');
    setSelectedDepartmentFilter('');
    setSelectedVotingPlaceFilter('');
    setSelectedPollingStationFilter('');
  };

  // Fonction pour exporter un graphique en SVG (simple et sans problème de couleurs)
  const exportChartAsImage = async (chartRef: React.RefObject<HTMLDivElement | null>, fileName: string, chartTitle: string) => {
    if (!chartRef.current) return;

    try {
      // Trouver le SVG principal du graphique (pas les icônes de légende)
      const svgElements = chartRef.current.querySelectorAll('svg');
      let svgElement = null;
      
      // Chercher le SVG principal (le plus grand, généralement le premier)
      for (const svg of svgElements) {
        const width = parseInt(svg.getAttribute('width') || '0');
        const height = parseInt(svg.getAttribute('height') || '0');
        // Le SVG principal est généralement plus grand que les icônes de légende (14x14)
        if (width > 50 && height > 50) {
          svgElement = svg;
          break;
        }
      }
      
      if (!svgElement) {
        alert('Aucun graphique principal trouvé à exporter.');
        return;
      }

      // Cloner le SVG
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      
      // S'assurer que le namespace est défini
      if (!svgClone.getAttribute('xmlns')) {
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }
      
      // Fonction pour copier les styles inline sur tous les éléments
      const copyComputedStyles = (source: Element, target: Element) => {
        const sourceStyles = window.getComputedStyle(source);
        const targetEl = target as HTMLElement | SVGElement;
        
        // Liste des propriétés importantes à copier
        const importantProps = [
          'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 
          'font-weight', 'text-anchor', 'dominant-baseline', 'opacity'
        ];
        
        importantProps.forEach(prop => {
          const value = sourceStyles.getPropertyValue(prop);
          if (value && value !== 'none' && !value.includes('oklch')) {
            // Copier l'attribut directement sur l'élément SVG plutôt que via style
            if (prop === 'fill' || prop === 'stroke') {
              targetEl.setAttribute(prop, value);
            } else {
              targetEl.style.setProperty(prop, value);
            }
          }
        });
        
        // Pour les éléments text, s'assurer que le fill est défini
        if (target.tagName === 'text' || target.tagName === 'tspan') {
          const fill = sourceStyles.getPropertyValue('fill');
          if (fill && !fill.includes('oklch')) {
            targetEl.setAttribute('fill', fill);
          }
        }
        
        // Pour les éléments path et rect dans les graphiques
        if (target.tagName === 'path' || target.tagName === 'rect' || target.tagName === 'circle') {
          // Copier les attributs natifs s'ils existent
          const sourceEl = source as SVGElement;
          if (sourceEl.hasAttribute('fill')) {
            const fill = sourceEl.getAttribute('fill');
            if (fill && !fill.includes('oklch')) {
              targetEl.setAttribute('fill', fill);
            }
          }
          if (sourceEl.hasAttribute('stroke')) {
            const stroke = sourceEl.getAttribute('stroke');
            if (stroke && !stroke.includes('oklch')) {
              targetEl.setAttribute('stroke', stroke);
            }
          }
        }
        
        // Récursion pour les enfants
        for (let i = 0; i < source.children.length; i++) {
          if (target.children[i]) {
            copyComputedStyles(source.children[i], target.children[i]);
          }
        }
      };
      
      // Copier les styles calculés
      copyComputedStyles(svgElement, svgClone);
      
      // Ajouter un fond blanc au SVG
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      svgClone.insertBefore(rect, svgClone.firstChild);

      // Ajouter un titre au graphique
      const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titleText.setAttribute('x', '50%');
      titleText.setAttribute('y', '30');
      titleText.setAttribute('text-anchor', 'middle');
      titleText.setAttribute('font-family', 'Arial, sans-serif');
      titleText.setAttribute('font-size', '18');
      titleText.setAttribute('font-weight', 'bold');
      titleText.setAttribute('fill', '#333333');
      titleText.textContent = chartTitle;
      svgClone.insertBefore(titleText, svgClone.firstChild?.nextSibling || svgClone.firstChild);

      // Sérialiser le SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);

      // Créer un blob et télécharger
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Message de succès
      console.log('Graphique exporté avec succès en SVG');
    } catch (error) {
      console.error('Erreur lors de l\'export du graphique:', error);
      alert(`Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return <ResultsPageFinalSkeleton />;
  }

  // Gestion spécifique des erreurs d'authentification
  if (error && error.includes('Session expirée')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-orange-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Session expirée</h3>
          <p className="text-gray-600 mb-4">
            Votre session a expiré. Veuillez vous reconnecter pour continuer.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={refreshAuth} variant="outline">
              Rafraîchir la session
            </Button>
            <Button onClick={() => window.location.href = '/auth/login'} variant="default">
              Se reconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0 || sortedCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-8 w-8 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun candidat disponible</h3>
          <p className="text-muted-foreground mb-4">
            Les données des candidats ne sont pas encore disponibles.
          </p>
          <Button onClick={refresh} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation des vues */}
      {loading ? (
        <ViewsNavigationSkeleton />
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {views.map((view) => (
                <Button
                  key={view.id}
                  variant={selectedView === view.id ? 'default' : 'outline'}
                  onClick={() => setSelectedView(view.id as 'overview' | 'table' | 'map')}
                  className="flex items-center gap-2"
                >
                  <view.icon className="h-4 w-4" />
                  {view.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue d'ensemble */}
      {selectedView === 'overview' && (
        loading ? (
          <OverviewPageSkeleton />
        ) : (
          <div className="space-y-8 p-2">
            {/* Section des candidats */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Vote className="h-6 w-6 text-blue-600" />
                    Résultats
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Candidats classés par numéro d'ordre sur le bulletin de vote
                  </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {candidates.length} candidats
                </Badge>
              </div>

              {/* Grille des cartes de candidats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {sortedCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    candidateColor={getCandidateColor(candidate)}
                    showDetails={false}
                    animated={true}
                    onClick={handleCandidateClick}
                  />
                ))}
              </div>
            </div>

            {/* Section graphiques rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-600" />
                      Répartition des voix
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportChartAsImage(donutChartRef, 'repartition-voix', 'Répartition des voix')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent ref={donutChartRef}>
                  <ResultsChart
                    results={candidates.map(c => ({
                      candidateId: c.id,
                      votes: c.results?.votes || 0,
                      percentage: c.results?.percentage || 0
                    }))}
                    candidates={candidates}
                    type="donut"
                    animated={true}
                    height={400}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Scores
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportChartAsImage(barChartRef, 'scores-candidats', 'Scores des candidats')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent ref={barChartRef}>
                  <ResultsChart
                    results={candidates.map(c => ({
                      candidateId: c.id,
                      votes: c.results?.votes || 0,
                      percentage: c.results?.percentage || 0
                    }))}
                    candidates={candidates}
                    type="horizontal-bar"
                    animated={true}
                    height={400}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}

      {/* Vue tableau avec filtres */}
      {selectedView === 'table' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Table className="h-6 w-6 text-blue-600" />
              Résultats publiés détaillés
            </h2>
          </div>

          {/* Statistiques des zones publiées */}
          <ZoneStats 
            zones={publishedZones} 
            loading={zonesLoading} 
          />

          {/* Navigation hiérarchique des zones */}
          <ZoneNavigation
            zones={publishedZones}
            loading={zonesLoading}
            error={zonesError}
            onZoneSelect={handleZoneSelect}
            onRefresh={refreshZones}
          />

          {/* Zone de résultats sélectionnée */}
          {selectedZone && (
            <ZoneResultsDisplay
              results={zoneResults}
              loading={zoneResultsLoading}
              error={zoneResultsError}
              onRefresh={refreshZoneResults}
            />
          )}

          {/* Message si aucune zone sélectionnée */}
          {!selectedZone && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Sélectionnez une zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une zone</h3>
                  <p className="text-gray-600">
                    Utilisez la navigation ci-dessus pour sélectionner une zone et voir ses résultats détaillés.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Vue carte interactive */}
      {/* {selectedView === 'map' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Map className="h-6 w-6 text-blue-600" />
              Cartographie interactive des résultats
            </h2>
            <p className="text-muted-foreground">
              Carte interactive de la Côte d'Ivoire avec visualisation des résultats par région. 
              Zoomez, déplacez-vous et cliquez sur les marqueurs pour explorer les détails.
            </p>
          </div>

          <InteractiveMap onRegionClick={handleRegionClick} />
        </div>
      )} */}

      {/* Modal de détails candidat */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  Détails - {selectedCandidate.fullName}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contenu détaillé du candidat */}
              <div className="text-center">
                <div 
                  className="text-6xl font-bold mb-2" 
                  style={{ color: selectedCandidate.party.color }}
                >
                  {selectedCandidate.results?.percentage || 0}%
                </div>
                <p className="text-muted-foreground">
                  {(selectedCandidate.results?.votes || 0).toLocaleString('fr-FR')} voix
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Rang {selectedCandidate.results?.rank || 'N/A'}
                  </Badge>
                  {selectedCandidate.results?.isWinner && (
                    <Badge className="ml-2 bg-yellow-500 text-yellow-900">
                      🥇 En tête
                    </Badge>
                  )}
                  {selectedCandidate.results?.isTied && (
                    <Badge className="ml-2 bg-orange-500 text-orange-900">
                      ⚖️ Égalité
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Plus de détails peuvent être ajoutés ici */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de détails région - Temporairement désactivée */}
      {selectedRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Map className="h-5 w-5" />
                  Détails région - Temporairement indisponible
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedRegion(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                Les détails régionaux seront disponibles prochainement avec l'API complète des résultats.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}