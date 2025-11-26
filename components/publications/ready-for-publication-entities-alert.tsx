'use client';

import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Building2,
  MapPin
} from 'lucide-react';
import type { PublishableEntity } from '@/types/publications';

interface ReadyForPublicationEntitiesAlertProps {
  entities: PublishableEntity[];
  loading?: boolean;
  onViewDetails?: (entity: PublishableEntity) => void;
  onPublish?: (entity: PublishableEntity) => void;
  onSearchEntity?: (searchTerm: string) => void;
  isUser?: boolean;
}

/**
 * Composant d'alerte pour les entités prêtes à publier
 * 
 * Une entité est considérée comme "prête" quand :
 * - Elle a TOUTES ses CELs importées (importedCels === totalCels)
 * - Elle n'est pas encore publiée (publicationStatus !== 'PUBLISHED')
 * - Elle n'est pas annulée (publicationStatus !== 'CANCELLED')
 */
export function ReadyForPublicationEntitiesAlert({ 
  entities, 
  loading = false, 
  onViewDetails,
  onPublish,
  onSearchEntity,
  isUser = false 
}: ReadyForPublicationEntitiesAlertProps) {
  
  // Calculer les entités prêtes pour la publication
  const readyEntities = useMemo(() => {
    const ready = entities.filter(entity => {
      // L'entité doit avoir TOUTES ses CELs importées
      const allCelsImported = entity.importedCels > 0 && entity.importedCels === entity.totalCels;
      
      // L'entité ne doit pas être déjà publiée ou annulée
      const isNotPublished = entity.publicationStatus !== 'PUBLISHED' && entity.publicationStatus !== 'CANCELLED';
      
      return allCelsImported && isNotPublished;
    });

    return ready;
  }, [entities]);

  // Séparer les entités par type
  const { departments, communes } = useMemo(() => {
    return {
      departments: readyEntities.filter(e => e.type === 'DEPARTMENT'),
      communes: readyEntities.filter(e => e.type === 'COMMUNE')
    };
  }, [readyEntities]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalReady = readyEntities.length;
    const totalDepartments = departments.length;
    const totalCommunes = communes.length;
    const totalImportedCels = readyEntities.reduce((sum, entity) => sum + entity.importedCels, 0);
    const totalPendingCels = readyEntities.reduce((sum, entity) => sum + entity.pendingCels, 0);
    
    return {
      totalReady,
      totalDepartments,
      totalCommunes,
      totalImportedCels,
      totalPendingCels,
      completionRate: totalReady > 0 ? Math.round((totalImportedCels / (totalImportedCels + totalPendingCels)) * 100) : 0
    };
  }, [readyEntities, departments, communes]);

  // Fonction pour gérer le clic sur une entité
  const handleEntityClick = (entity: PublishableEntity) => {
    if (onSearchEntity) {
      onSearchEntity(entity.libelle);
    }
  };

  // Icône selon le type d'entité
  const getEntityIcon = (type: 'DEPARTMENT' | 'COMMUNE') => {
    return type === 'DEPARTMENT' 
      ? <Building2 className="h-3 w-3 text-blue-600" />
      : <MapPin className="h-3 w-3 text-indigo-600" />;
  };

  // Ne pas afficher l'alerte s'il n'y a pas d'entités prêtes
  if (loading || readyEntities.length === 0) {
    return null;
  }

  // Pour les utilisateurs USER, afficher une version plus compacte
  if (isUser) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <AlertTitle className="text-green-900">
              {stats.totalReady} entité{stats.totalReady > 1 ? 's' : ''} prête{stats.totalReady > 1 ? 's' : ''} pour consolidation
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {stats.totalDepartments > 0 && `${stats.totalDepartments} département${stats.totalDepartments > 1 ? 's' : ''}`}
              {stats.totalDepartments > 0 && stats.totalCommunes > 0 && ' • '}
              {stats.totalCommunes > 0 && `${stats.totalCommunes} commune${stats.totalCommunes > 1 ? 's' : ''}`}
              {' • '}
              {stats.totalImportedCels} CELs importées
            </AlertDescription>
            {/* Liste cliquable des entités pour USER */}
            <div className="flex flex-wrap gap-2 mt-2">
              {readyEntities.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => handleEntityClick(entity)}
                  className={`text-xs px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                    entity.type === 'COMMUNE'
                      ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300'
                      : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
                  }`}
                >
                  {getEntityIcon(entity.type)}
                  {entity.libelle}
                </button>
              ))}
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            {stats.completionRate}% complété
          </Badge>
        </div>
      </Alert>
    );
  }

  const actionText = isUser ? 'consolidation' : 'publication';

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="text-blue-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {stats.totalReady} entité{stats.totalReady > 1 ? 's' : ''} prête{stats.totalReady > 1 ? 's' : ''} pour la {actionText}
            </AlertTitle>
            <AlertDescription className="text-blue-700 mt-1">
              {stats.totalDepartments > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {stats.totalDepartments} département{stats.totalDepartments > 1 ? 's' : ''}
                </span>
              )}
              {stats.totalDepartments > 0 && stats.totalCommunes > 0 && ' • '}
              {stats.totalCommunes > 0 && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {stats.totalCommunes} commune{stats.totalCommunes > 1 ? 's' : ''}
                </span>
              )}
              {' - '}
              {stats.totalReady > 1 
                ? `Ces entités ont des données importées et peuvent être ${isUser ? 'consolidées' : 'publiées'}.`
                : `Cette entité a des données importées et peut être ${isUser ? 'consolidée' : 'publiée'}.`
              }
            </AlertDescription>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">
                <strong>{stats.totalReady}</strong> entité{stats.totalReady > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-blue-700">
                <strong>{stats.totalImportedCels}</strong> CELs importées
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-blue-700">
                <strong>{stats.totalPendingCels}</strong> CELs en attente
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-blue-700">
                <strong>{stats.completionRate}%</strong> complété
              </span>
            </div>
          </div>

          {/* Liste des entités prêtes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900">
              Entités prêtes :
            </h4>
            <div className="flex flex-wrap gap-2">
              {readyEntities.map((entity) => (
                <Card 
                  key={entity.id} 
                  className={`p-3 border transition-colors cursor-pointer hover:shadow-sm ${
                    entity.type === 'COMMUNE'
                      ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                      : 'bg-white border-blue-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleEntityClick(entity)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={entity.type === 'COMMUNE' 
                            ? 'text-indigo-700 border-indigo-300' 
                            : 'text-blue-700 border-blue-300'
                          }
                        >
                          {entity.code}
                        </Badge>
                        <span className="text-sm font-medium text-blue-900 truncate flex items-center gap-1">
                          {getEntityIcon(entity.type)}
                          {entity.libelle}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-blue-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {entity.importedCels} importées
                        </span>
                        {entity.pendingCels > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entity.pendingCels} en attente
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        Cliquez pour rechercher cette entité
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
}

export default ReadyForPublicationEntitiesAlert;

