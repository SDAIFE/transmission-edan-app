'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X, Building2, MapPin } from 'lucide-react';
import type { EntityFilters, PublicationStatus, EntityType } from '@/types/publications';

interface EntityFiltersProps {
  filters: EntityFilters;
  onFiltersChange: (filters: EntityFilters) => void;
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function EntityFiltersComponent({
  filters,
  onFiltersChange,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange
}: EntityFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus | 'all'>(
    filters.publicationStatus || 'all'
  );
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>(
    filters.type || 'all'
  );

  // Référence pour éviter la boucle infinie
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Appliquer les filtres avec un délai pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        ...filtersRef.current,
        search: searchTerm || undefined,
        publicationStatus: selectedStatus === 'all' ? undefined : selectedStatus,
        type: selectedType === 'all' ? undefined : selectedType,
        page: 1 // Reset à la page 1 lors du changement de filtre
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedType, onFiltersChange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedType('all');
    onFiltersChange({
      page: 1,
      limit: filtersRef.current.limit || 10
    });
  };

  const hasActiveFilters = searchTerm || selectedStatus !== 'all' || selectedType !== 'all';

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      onFiltersChange({
        ...filtersRef.current,
        page
      });
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et Recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, code département ou commune&hellip;"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Filtre par type d'entité */}
          <div className="w-full sm:w-48">
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as EntityType | 'all')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    Tous les types
                  </div>
                </SelectItem>
                <SelectItem value="DEPARTMENT">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Départements
                  </div>
                </SelectItem>
                <SelectItem value="COMMUNE">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Communes Abidjan
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par statut */}
          <div className="w-full sm:w-48">
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as PublicationStatus | 'all')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PUBLISHED">Publiés</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CANCELLED">Annulés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bouton de réinitialisation */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          )}
        </div>

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtres actifs :</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Recherche: &quot;{searchTerm}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedType === 'DEPARTMENT' ? (
                  <>
                    <Building2 className="h-3 w-3" />
                    Départements
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3" />
                    Communes Abidjan
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSelectedType('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedStatus !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Statut: {selectedStatus === 'PUBLISHED' ? 'Publiés' : 
                        selectedStatus === 'PENDING' ? 'En attente' : 'Annulés'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSelectedStatus('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bouton Précédent */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Précédent
              </Button>

              {/* Numéros de pages */}
              <div className="flex items-center gap-1">
                {generatePageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              {/* Bouton Suivant */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

