'use client';

import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import type { DepartmentData } from '@/types/publications';

interface ReadyForPublicationAlertProps {
  departments: DepartmentData[];
  loading?: boolean;
  onViewDetails?: (department: DepartmentData) => void;
  onPublish?: (department: DepartmentData) => void;
  onSearchDepartment?: (searchTerm: string) => void;
  isUser?: boolean;
}

/**
 * Composant d'alerte pour les départements prêts à publier
 * 
 * Un département est considéré comme "prêt" quand :
 * - Il a TOUTES ses CELs importées (importedCels === totalCels)
 * - Il n'est pas encore publié (publicationStatus !== 'PUBLISHED')
 * - Il n'est pas annulé (publicationStatus !== 'CANCELLED')
 */
export function ReadyForPublicationAlert({ 
  departments, 
  loading = false, 
  onViewDetails,
  onPublish,
  onSearchDepartment,
  isUser = false 
}: ReadyForPublicationAlertProps) {
  
  // Calculer les départements prêts pour la publication
  const readyDepartments = useMemo(() => {
    const ready = departments.filter(dept => {
      // Le département doit avoir TOUTES ses CELs importées
      // Un département est prêt seulement si : importedCels === totalCels
      const allCelsImported = dept.importedCels > 0 && dept.importedCels === dept.totalCels;
      
      // Le département ne doit pas être déjà publié ou annulé
      const isNotPublished = dept.publicationStatus !== 'PUBLISHED' && dept.publicationStatus !== 'CANCELLED';
      
      return allCelsImported && isNotPublished;
    });

    // Log temporairement supprimé pour éviter la boucle infinie
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('🔍 [ReadyForPublicationAlert] Départements analysés:', {
    //     total: departments.length,
    //     ready: ready.length,
    //     readyDepartments: ready.map(d => ({ 
    //       code: d.codeDepartement, 
    //       name: d.libelleDepartement, 
    //       importedCels: d.importedCels,
    //       totalCels: d.totalCels,
    //       completion: `${d.importedCels}/${d.totalCels}`,
    //       status: d.publicationStatus 
    //     })),
    //     notReady: departments.filter(d => d.importedCels > 0 && d.importedCels !== d.totalCels).map(d => ({
    //       code: d.codeDepartement,
    //       name: d.libelleDepartement,
    //       importedCels: d.importedCels,
    //       totalCels: d.totalCels,
    //       completion: `${d.importedCels}/${d.totalCels}`,
    //       status: d.publicationStatus
    //     })),
    //     note: 'Un département est prêt seulement si importedCels === totalCels'
    //   });
    // }

    return ready;
  }, [departments]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalReady = readyDepartments.length;
    const totalImportedCels = readyDepartments.reduce((sum, dept) => sum + dept.importedCels, 0);
    const totalPendingCels = readyDepartments.reduce((sum, dept) => sum + dept.pendingCels, 0);
    
    return {
      totalReady,
      totalImportedCels,
      totalPendingCels,
      completionRate: totalReady > 0 ? Math.round((totalImportedCels / (totalImportedCels + totalPendingCels)) * 100) : 0
    };
  }, [readyDepartments]);

  // Fonction pour gérer le clic sur un département
  const handleDepartmentClick = (department: DepartmentData) => {
    if (onSearchDepartment) {
      onSearchDepartment(department.libelleDepartement);
    }
  };

  // Ne pas afficher l'alerte s'il n'y a pas de départements prêts
  if (loading || readyDepartments.length === 0) {
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
              {stats.totalReady} département{stats.totalReady > 1 ? 's' : ''} prêt{stats.totalReady > 1 ? 's' : ''} pour consolidation
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {stats.totalImportedCels} CELs importées dans {stats.totalReady} département{stats.totalReady > 1 ? 's' : ''}
            </AlertDescription>
            {/* Liste cliquable des départements pour USER */}
            <div className="flex flex-wrap gap-2 mt-2">
              {readyDepartments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentClick(dept)}
                  className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded border border-green-300 transition-colors cursor-pointer"
                >
                  {dept.libelleDepartement}
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
  const actionTextPlural = isUser ? 'consolidations' : 'publications';

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
              {stats.totalReady} département{stats.totalReady > 1 ? 's' : ''} prêt{stats.totalReady > 1 ? 's' : ''} pour la {actionText}
            </AlertTitle>
            <AlertDescription className="text-blue-700 mt-1">
              {stats.totalReady > 1 
                ? `Ces départements ont des données importées et peuvent être ${isUser ? 'consolidés' : 'publiés'}.`
                : `Ce département a des données importées et peut être ${isUser ? 'consolidé' : 'publié'}.`
              }
            </AlertDescription>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">
                <strong>{stats.totalReady}</strong> département{stats.totalReady > 1 ? 's' : ''}
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

          {/* Liste des départements prêts */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900">
              Départements prêts :
            </h4>
            <div className="flex flex-wrap gap-2">
              {readyDepartments.map((dept) => (
                <Card 
                  key={dept.id} 
                  className="p-3 bg-white border-blue-200 hover:border-blue-300 transition-colors cursor-pointer hover:shadow-sm"
                  onClick={() => handleDepartmentClick(dept)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {dept.codeDepartement}
                        </Badge>
                        <span className="text-sm font-medium text-blue-900 truncate">
                          {dept.libelleDepartement}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-blue-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {dept.importedCels} importées
                        </span>
                        {dept.pendingCels > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dept.pendingCels} en attente
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        Cliquez pour rechercher ce département
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

export default ReadyForPublicationAlert;
