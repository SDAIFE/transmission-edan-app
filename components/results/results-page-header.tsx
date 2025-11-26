'use client';

import { 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  MapPin,
  User,
  UserCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useElectionHeader } from '@/hooks/use-election-header';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonStatCard, SkeletonDepartmentsList } from '@/components/ui/skeleton-components';

interface ResultsPageHeaderProps {
  electionId?: string;
}

export function ResultsPageHeader({ electionId = 'election-2025' }: ResultsPageHeaderProps) {
  const { headerData, loading, error, refresh } = useElectionHeader(electionId);

  // Détecter si nous sommes en mode skeleton (données avec des zéros)
  const isSkeletonMode = headerData && headerData.inscrits === 0;

  // Fonction utilitaire pour formater les dates de manière sécurisée
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Date non disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Gestion des états de chargement et d'erreur
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium mb-1">Impossible de charger les résultats</p>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={refresh}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Réessayer
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton pour l'en-tête principal */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="relative px-8 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-80" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-40 w-40 rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Skeleton pour la bande des départements */}
        <Skeleton className="h-16 rounded-lg" />
        
        {/* Skeleton pour le carrousel mobile */}
        <div className="lg:hidden">
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!headerData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat disponible</h3>
          <p className="text-gray-600 mb-4">
            Les résultats électoraux ne sont pas encore disponibles.
          </p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête principal avec animation */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Informations de l'élection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-gray-700" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                    {headerData.nom}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(headerData.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>Côte d&apos;Ivoire</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques rapides intégrées */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {isSkeletonMode ? (
                  // Mode skeleton - afficher des squelettes
                  <>
                    <SkeletonStatCard label="Inscrits" showGenderStats={true} />
                    <SkeletonStatCard label="Votants" showGenderStats={true} />
                    <SkeletonStatCard label="Taux de Participation" />
                    <SkeletonStatCard label="Suffrage Exprimé" />
                  </>
                ) : (
                  // Mode normal - afficher les vraies données
                  [
                    {
                      label: 'Inscrits',
                      value: (headerData.inscrits || 0).toLocaleString('fr-FR'),
                      icon: Users,
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-100',
                      genderStats: {
                        hommes: (headerData.inscritsHommes || 0).toLocaleString('fr-FR'),
                        femmes: (headerData.inscritsFemmes || 0).toLocaleString('fr-FR')
                      }
                    },
                    {
                      label: 'Votants',
                      value: (headerData.votants || 0).toLocaleString('fr-FR'),
                      icon: TrendingUp,
                      color: 'text-green-600',
                      bgColor: 'bg-green-100',
                      genderStats: {
                        hommes: (headerData.votantsHommes || 0).toLocaleString('fr-FR'),
                        femmes: (headerData.votantsFemmes || 0).toLocaleString('fr-FR')
                      }
                    },
                    {
                      label: 'Taux de Participation',
                      value: `${headerData.tauxParticipation || 0}%`,
                      icon: BarChart3,
                      color: 'text-gray-700',
                      bgColor: 'bg-gray-100'
                    },
                    {
                      label: 'Suffrage Exprimé',
                      value: (headerData.suffrageExprime || 0).toLocaleString('fr-FR'),
                      icon: Clock,
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-100'
                    }
                  ].map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold text-gray-800 mb-2">
                            {stat.value}
                          </p>
                          
                          {/* Affichage des statistiques par genre pour inscrits et votants */}
                          {stat.genderStats && (
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-orange-600">
                                <User className="h-3 w-3" />
                                <span>Homme: {stat.genderStats.hommes}</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <UserCheck className="h-3 w-3" />
                                <span>Femme: {stat.genderStats.femmes}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Animation de présentation des candidats */}
            {/* <div className="hidden lg:block lg:w-80 xl:w-96">
              <CandidateCarousel 
                candidates={mockElectionResults.candidates}
                autoPlay={true}
                interval={4000}
                showRank={true}
              />
            </div> */}
            {/* Logo de la CEI */}
            <div className="flex items-center gap-2">
              <Image 
                src="/images/logos/logocei2.webp" 
                alt="CEI" 
                width={100} 
                height={100} 
                className="w-40 h-40"
              />
            </div>
          </div>
        </div>

        {/* Effet de particules animées fixes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => {
            const seed = i * 7; // Utiliser l'index pour générer des valeurs fixes
            const sizeClass = ['particle-small', 'particle-medium', 'particle-large', 'particle-xl'][seed % 4];
            const positionClass = `particle-pos-${i}`;
            
            return (
              <div
                key={i}
                className={`absolute bg-white/10 rounded-full animate-pulse ${sizeClass} ${positionClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* Bande d'annonce des départements publiés - Affichage conditionnel */}
      {isSkeletonMode ? (
        /* Mode skeleton - afficher le skeleton des départements */
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-full p-2 border border-gray-300">
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="text-right">
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ) : headerData.departementsPublies && headerData.departementsPublies.length > 0 ? (
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-lg p-4 shadow-lg border border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-full p-2 border border-white/20">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">DÉPARTEMENTS PUBLIÉS</h3>
                <p className="text-blue-100 text-xs font-medium">Résultats officiels disponibles</p>
              </div>
            </div>
            {/* Départements publiés */}
            <div className="overflow-hidden flex-1 max-w-5xl ml-4">
              <div className="flex items-center gap-4 text-white text-sm font-medium">
                {headerData.departementsPublies.map((departement: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 whitespace-nowrap">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{departement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Message informatif quand aucun département n'est publié */
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-full p-2 border border-amber-300">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-amber-800 font-semibold text-sm">PUBLICATION EN COURS</h3>
              <p className="text-amber-700 text-xs">
                Les résultats par département seront publiés au fur et à mesure de leur traitement
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-600 font-medium">
                {headerData.departementsPublies?.length || 0} département{headerData.departementsPublies?.length !== 1 ? 's' : ''} publié{headerData.departementsPublies?.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-amber-500">
                En attente de traitement
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version mobile simplifiée */}
      <div className="lg:hidden">
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Consultez la page des résultats pour voir les candidats</p>
        </div>
      </div>

    </div>
  );
}
