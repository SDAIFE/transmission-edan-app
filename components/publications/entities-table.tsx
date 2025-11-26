'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Building2,
  Calendar,
  Hash,
  MapPin
} from 'lucide-react';
import type { 
  EntitiesTableProps, 
  PublishableEntity, 
  PublicationStatus, 
  EntityType 
} from '@/types/publications';

export function EntitiesTable({ 
  entities = [], 
  loading = false, 
  onRefresh,
  onPublish,
  onCancel,
  onViewDetails,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  filters,
  onFiltersChange,
  isUser = false
}: EntitiesTableProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  // Protection contre undefined
  const safeEntities = entities || [];

  // Adaptation des termes selon le rôle
  const publishAction = isUser ? 'Consolider' : 'Publier';
  const publishActionLower = isUser ? 'consolider' : 'publier';
  const publishActionPast = isUser ? 'consolidé' : 'publié';
  const publishActionPastFeminine = isUser ? 'consolidée' : 'publiée';
  const publishActionGerund = isUser ? 'consolidation' : 'publication';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {publishActionPastFeminine}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Annulée
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <RefreshCw className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Inconnu
          </Badge>
        );
    }
  };

  // Icône selon le type d'entité
  const getEntityIcon = (type: EntityType) => {
    return type === 'DEPARTMENT' 
      ? <Building2 className="h-4 w-4 text-blue-600" />
      : <MapPin className="h-4 w-4 text-indigo-600" />;
  };

  // Couleur de fond selon le type d'entité
  const getEntityRowClass = (entity: PublishableEntity) => {
    if (selectedEntity === entity.id) {
      return 'bg-muted/50';
    }
    return entity.type === 'COMMUNE' ? 'bg-blue-50/30 hover:bg-blue-50/50' : '';
  };

  const handleAction = (action: () => void, entityId: string) => {
    setSelectedEntity(entityId);
    action();
    // Reset après un délai pour permettre l'animation
    setTimeout(() => setSelectedEntity(null), 1000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entités publiables</CardTitle>
          <CardDescription>Chargement des départements et communes&hellip;</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entités publiables
            </CardTitle>
            <CardDescription>
              {safeEntities.length} entité{safeEntities.length > 1 ? 's' : ''} au total
              {totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {safeEntities.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune entité trouvée</h3>
            <p className="text-muted-foreground">
              Aucun département ou commune n&apos;a été trouvé pour le moment.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entité</TableHead>
                <TableHead>Total CELs</TableHead>
                <TableHead>Importées</TableHead>
                <TableHead>En Attente</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière MAJ</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeEntities.map((entity) => (
                <TableRow 
                  key={entity.id}
                  className={getEntityRowClass(entity)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEntityIcon(entity.type)}
                      <div>
                        <div className="font-medium text-sm">
                          {entity.libelle}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{entity.code}</span>
                          {entity.type === 'COMMUNE' && (
                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                              Commune
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span>{entity.totalCels}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{entity.importedCels}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <RefreshCw className={`h-3 w-3 ${entity.pendingCels > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                      <span className={entity.pendingCels > 0 ? 'text-yellow-600' : 'text-green-600'}>
                        {entity.pendingCels}
                      </span>
                      {entity.pendingCels === 0 && (
                        <span className="text-xs text-green-600 ml-1">✓</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(entity.publicationStatus)}
                      {entity.publicationStatus !== 'PUBLISHED' && entity.pendingCels > 0 && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                          {entity.pendingCels} CEL(s) en attente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{formatDate(entity.lastUpdate)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            if (process.env.NODE_ENV === 'development') {
                              console.log('👁️ [EntitiesTable] Voir détails:', entity);
                            }
                            if (onViewDetails) {
                              onViewDetails(entity);
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </DropdownMenuItem>
                        
                        {/* Bouton Publier - désactivé si CELs en attente */}
                        {entity.publicationStatus !== 'PUBLISHED' && onPublish && (
                          <DropdownMenuItem 
                            onClick={() => handleAction(() => onPublish(entity), entity.id)}
                            disabled={entity.pendingCels > 0}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {publishAction}
                            {entity.pendingCels > 0 && ' (CELs en attente)'}
                          </DropdownMenuItem>
                        )}
                        
                        {/* Bouton Annuler - seulement si publié */}
                        {entity.publicationStatus === 'PUBLISHED' && onCancel && (
                          <DropdownMenuItem 
                            onClick={() => handleAction(() => onCancel(entity), entity.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler la {publishActionGerund}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

