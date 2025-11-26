'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { Filter, X, RefreshCw } from 'lucide-react';
import { ImportStatus } from '@/types/upload';
import { listsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ImportFiltersProps } from '@/types/upload';

interface ExtendedImportFiltersProps extends ImportFiltersProps {
  availableRegions?: { codeRegion: string; libelleRegion: string }[];
  availableDepartments?: { codeDepartement: string; libelleDepartement: string }[];
  imports?: any[]; // Pour extraire les régions/départements réellement présents
}

export function ImportFilters({ 
  filters, 
  onFiltersChange, 
  availableCels,
  availableRegions = [],
  availableDepartments = [],
  imports = [],
  loading = false 
}: ExtendedImportFiltersProps) {
  const [selectedCels, setSelectedCels] = useState<string[]>(
    filters.codeCellule ? [filters.codeCellule] : []
  );
  const [selectedStatus, setSelectedStatus] = useState<ImportStatus | 'all'>(filters.statut || 'all');
  const [selectedRegion, setSelectedRegion] = useState<string>(filters.codeRegion || 'all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(filters.codeDepartement || 'all');
  
  // Ref pour éviter les appels répétés
  const isInitialMount = useRef(true);
  
  // Récupérer l'utilisateur connecté
  const { user } = useAuth();

  // Filtrer les CELs selon l'utilisateur et préparer les options pour le MultiSelect
  const getFilteredCels = () => {
    if (user?.role?.code === 'USER') {
      // Pour les utilisateurs USER, ne montrer que leurs CELs attribuées
      if (user.cellules && user.cellules.length > 0) {
        const userCelCodes = user.cellules.map(cel => cel.codeCellule);
        return availableCels.filter(cel => userCelCodes.includes(cel.codeCellule));
      } else {
        // Si l'utilisateur n'a pas de CELs attribuées, ne montrer aucune CEL
        return [];
      }
    }
    // Pour ADMIN et SADMIN, montrer toutes les CELs
    return availableCels;
  };

  const baseCelsFiltered = getFilteredCels();

  // ✨ NOUVEAU : Filtrer les CELs selon la région et/ou le département sélectionnés
  const filteredCels = (() => {
    let celsToFilter = baseCelsFiltered;

    // Si un département est sélectionné, filtrer par département (le plus spécifique)
    if (selectedDepartment !== 'all') {
      const celsInDepartment = new Set<string>();
      
      imports.forEach((importData: any) => {
        if (importData.departement?.codeDepartement === selectedDepartment) {
          celsInDepartment.add(importData.codeCellule);
        }
      });

      celsToFilter = celsToFilter.filter(cel => celsInDepartment.has(cel.codeCellule));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [ImportFilters] CELs filtrées par département:', {
          departement: selectedDepartment,
          count: celsToFilter.length
        });
      }
    }
    // Sinon, si une région est sélectionnée, filtrer par région
    else if (selectedRegion !== 'all') {
      const celsInRegion = new Set<string>();
      
      imports.forEach((importData: any) => {
        if (importData.region?.codeRegion === selectedRegion) {
          celsInRegion.add(importData.codeCellule);
        }
      });

      celsToFilter = celsToFilter.filter(cel => celsInRegion.has(cel.codeCellule));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [ImportFilters] CELs filtrées par région:', {
          region: selectedRegion,
          count: celsToFilter.length
        });
      }
    }

    return celsToFilter;
  })();

  // ✨ NOUVEAU : Extraire les régions uniques des imports (selon permissions utilisateur)
  const getAvailableRegionsFromImports = () => {
    if (user?.role?.code === 'USER') {
      // Pour USER : Uniquement les régions des imports de ses CELs
      const userCelCodes = user.cellules?.map(cel => cel.codeCellule) || [];
      
      // Extraire les régions uniques des imports de l'utilisateur
      const uniqueRegions = new Map<string, string>();
      
      imports.forEach((importData: any) => {
        // Vérifier si cet import appartient à une CEL de l'utilisateur
        if (userCelCodes.includes(importData.codeCellule) && importData.region) {
          uniqueRegions.set(importData.region.codeRegion, importData.region.libelleRegion);
        }
      });
      
      // Convertir en tableau et trier par libellé
      return Array.from(uniqueRegions.entries())
        .map(([codeRegion, libelleRegion]) => ({ codeRegion, libelleRegion }))
        .sort((a, b) => a.libelleRegion.localeCompare(b.libelleRegion));
    }
    
    // Pour ADMIN et SADMIN : Toutes les régions
    return availableRegions;
  };

  // ✨ NOUVEAU : Extraire les départements uniques des imports (selon permissions utilisateur)
  const getAvailableDepartmentsFromImports = () => {
    if (user?.role?.code === 'USER') {
      // Pour USER : Uniquement les départements des imports de ses CELs
      const userCelCodes = user.cellules?.map(cel => cel.codeCellule) || [];
      
      // Extraire les départements uniques des imports de l'utilisateur
      const uniqueDepartments = new Map<string, { codeDepartement: string; libelleDepartement: string; codeRegion?: string }>();
      
      imports.forEach((importData: any) => {
        // Vérifier si cet import appartient à une CEL de l'utilisateur
        if (userCelCodes.includes(importData.codeCellule) && importData.departement) {
          uniqueDepartments.set(importData.departement.codeDepartement, {
            codeDepartement: importData.departement.codeDepartement,
            libelleDepartement: importData.departement.libelleDepartement,
            codeRegion: importData.region?.codeRegion // ✨ Inclure le code région
          });
        }
      });
      
      // Convertir en tableau et trier par libellé
      return Array.from(uniqueDepartments.values())
        .sort((a, b) => a.libelleDepartement.localeCompare(b.libelleDepartement));
    }
    
    // Pour ADMIN et SADMIN : Tous les départements
    return availableDepartments;
  };

  const filteredRegions = getAvailableRegionsFromImports();
  const allFilteredDepartments = getAvailableDepartmentsFromImports();

  // ✨ NOUVEAU : Filtrer les départements selon la région sélectionnée
  const filteredDepartments = (() => {
    // Si aucune région n'est sélectionnée, afficher tous les départements disponibles
    if (selectedRegion === 'all') {
      return allFilteredDepartments;
    }

    // Si une région est sélectionnée, filtrer les départements de cette région
    if (user?.role?.code === 'USER') {
      // Pour USER : Filtrer les départements de la région sélectionnée parmi ses imports
      return allFilteredDepartments.filter((dept: any) => dept.codeRegion === selectedRegion);
    } else {
      // Pour ADMIN/SADMIN : Filtrer les départements de la région sélectionnée parmi tous les départements
      // On doit extraire cette info des imports
      const departementsDeRegion = new Set<string>();
      
      imports.forEach((importData: any) => {
        if (importData.region?.codeRegion === selectedRegion && importData.departement) {
          departementsDeRegion.add(importData.departement.codeDepartement);
        }
      });

      return availableDepartments.filter(dept => departementsDeRegion.has(dept.codeDepartement));
    }
  })();

  // ✨ NOUVEAU : Réinitialiser le département quand la région change
  useEffect(() => {
    // Si "Toutes les régions" est sélectionnée et qu'un département spécifique est sélectionné
    if (selectedRegion === 'all' && selectedDepartment !== 'all') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [ImportFilters] Réinitialisation du département (toutes les régions sélectionnées)');
      }
      setSelectedDepartment('all');
    }
    
    // Si une région spécifique est sélectionnée
    if (selectedRegion !== 'all') {
      // Vérifier si le département actuellement sélectionné appartient à cette région
      const departementValide = filteredDepartments.some(
        dept => dept.codeDepartement === selectedDepartment
      );
      
      // Si le département sélectionné n'est pas dans la région, le réinitialiser
      if (!departementValide && selectedDepartment !== 'all') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [ImportFilters] Réinitialisation du département (région changée)');
        }
        setSelectedDepartment('all');
      }
    }
  }, [selectedRegion, filteredDepartments, selectedDepartment]);

  // ✨ NOUVEAU : Décocher les CELs qui ne sont plus dans la zone géographique filtrée
  useEffect(() => {
    if (selectedCels.length > 0 && (selectedRegion !== 'all' || selectedDepartment !== 'all')) {
      // Vérifier si toutes les CELs sélectionnées sont toujours dans les CELs filtrées
      const validCelCodes = new Set(filteredCels.map(cel => cel.codeCellule));
      const invalidSelectedCels = selectedCels.filter(celCode => !validCelCodes.has(celCode));
      
      if (invalidSelectedCels.length > 0) {
        // Retirer les CELs qui ne sont plus valides
        const newSelectedCels = selectedCels.filter(celCode => validCelCodes.has(celCode));
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [ImportFilters] Désélection des CELs hors zone:', {
            invalidCels: invalidSelectedCels,
            remainingCels: newSelectedCels
          });
        }
        
        setSelectedCels(newSelectedCels);
      }
    }
  }, [selectedRegion, selectedDepartment, filteredCels, selectedCels]);

  // Appliquer les filtres avec debounce pour la recherche
  useEffect(() => {
    // Éviter l'appel au montage initial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const newFilters = {
        page: 1, // Reset à la première page lors du filtrage
        limit: 10, // Valeur fixe pour éviter les dépendances
        codeCellule: selectedCels.length > 0 ? selectedCels.join(',') : undefined, // CELs sélectionnées
        statut: selectedStatus === 'all' ? undefined : selectedStatus,
        codeRegion: selectedRegion === 'all' ? undefined : selectedRegion, // ✨ NOUVEAU
        codeDepartement: selectedDepartment === 'all' ? undefined : selectedDepartment, // ✨ NOUVEAU
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [ImportFilters] Application des filtres:', {
          selectedCels,
          selectedStatus,
          selectedRegion,
          selectedDepartment,
          newFilters,
          filteredCelsCount: filteredCels.length
        });
      }
      
      onFiltersChange(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCels, selectedStatus, selectedRegion, selectedDepartment, filteredCels.length]); // ✨ Ajout des nouvelles dépendances

  const clearFilters = () => {
    setSelectedCels([]);
    setSelectedStatus('all');
    setSelectedRegion('all');
    setSelectedDepartment('all');
    onFiltersChange({
      page: 1,
      limit: 10
    });
  };

  const hasActiveFilters = selectedCels.length > 0 || selectedStatus !== 'all' || selectedRegion !== 'all' || selectedDepartment !== 'all';
  
  const celOptions: MultiSelectOption[] = filteredCels.map((cel) => ({
    value: cel.codeCellule,
    label: cel.libelleCellule,
    description: `Code: ${cel.codeCellule}`
  }));

  return (
    <Card >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ✨ NOUVEAU : Filtre par Région */}
          <div className="space-y-2">
            <Label htmlFor="region-filter">Région</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les régions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {filteredRegions.map((region) => (
                  <SelectItem key={region.codeRegion} value={region.codeRegion}>
                    {region.libelleRegion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ✨ NOUVEAU : Filtre par Département */}
          <div className="space-y-2">
            <Label htmlFor="department-filter">
              Département
              {selectedRegion !== 'all' && (
                <span className="ml-1 text-xs text-blue-600">
                  (filtré par région)
                </span>
              )}
            </Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedRegion !== 'all' 
                    ? `Départements de la région sélectionnée` 
                    : "Tous les départements"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {selectedRegion !== 'all' 
                    ? `Tous les départements de la région` 
                    : "Tous les départements"}
                </SelectItem>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <SelectItem key={dept.codeDepartement} value={dept.codeDepartement}>
                      {dept.libelleDepartement}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Aucun département dans cette région
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par CEL */}
          <div className="space-y-2">
            <Label htmlFor="cel-filter">
              Commission Électorale
              {(selectedRegion !== 'all' || selectedDepartment !== 'all') && (
                <span className="ml-1 text-xs text-blue-600">
                  {selectedDepartment !== 'all' 
                    ? '(filtré par département)' 
                    : '(filtré par région)'}
                </span>
              )}
            </Label>
            <MultiSelect
              options={celOptions}
              selected={selectedCels}
              onChange={setSelectedCels}
              placeholder={
                selectedDepartment !== 'all' 
                  ? "CELs du département sélectionné..." 
                  : selectedRegion !== 'all'
                    ? "CELs de la région sélectionnée..."
                    : "Sélectionner les CELs..."
              }
              searchPlaceholder="Rechercher une CEL..."
              emptyText={
                (selectedRegion !== 'all' || selectedDepartment !== 'all')
                  ? "Aucune CEL dans cette zone géographique."
                  : user?.role?.code === 'USER' 
                    ? "Aucune CEL attribuée à votre compte." 
                    : "Aucune CEL trouvée."
              }
              maxDisplay={2}
            />
            
            {/* Message informatif */}
            <div className="text-xs text-muted-foreground">
              {user?.role?.code === 'USER' ? (
                // Message pour USER
                filteredCels.length > 0 ? (
                  <span className="text-blue-600">
                    📋 {filteredCels.length} CEL{filteredCels.length > 1 ? 's' : ''} 
                    {(selectedRegion !== 'all' || selectedDepartment !== 'all') 
                      ? ' dans cette zone' 
                      : ' attribuée' + (filteredCels.length > 1 ? 's' : '') + ' à votre compte'}
                  </span>
                ) : (
                  <span className="text-orange-600">
                    {(selectedRegion !== 'all' || selectedDepartment !== 'all')
                      ? '⚠️ Aucune CEL attribuée dans cette zone.'
                      : '⚠️ Aucune CEL n\'est attribuée à votre compte. Contactez votre administrateur.'}
                  </span>
                )
              ) : (
                // Message pour ADMIN/SADMIN
                (selectedRegion !== 'all' || selectedDepartment !== 'all') && (
                  <span className="text-blue-600">
                    📋 {filteredCels.length} CEL{filteredCels.length > 1 ? 's' : ''} dans cette zone
                  </span>
                )
              )}
            </div>
          </div>

          {/* Filtre par statut */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Statut</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ImportStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value={ImportStatus.N}>En attente</SelectItem>
                <SelectItem value={ImportStatus.I}>Importé</SelectItem>
                <SelectItem value={ImportStatus.P}>Publié</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                {selectedRegion && selectedRegion !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Région: {filteredRegions.find(r => r.codeRegion === selectedRegion)?.libelleRegion || selectedRegion}
                  </Badge>
                )}
                {selectedDepartment && selectedDepartment !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Dép.: {filteredDepartments.find(d => d.codeDepartement === selectedDepartment)?.libelleDepartement || selectedDepartment}
                  </Badge>
                )}
                {selectedCels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedCels.slice(0, 3).map((celCode) => {
                      const cel = filteredCels.find(c => c.codeCellule === celCode);
                      return (
                        <Badge key={celCode} variant="secondary" className="text-xs">
                          CEL: {cel?.libelleCellule || celCode}
                        </Badge>
                      );
                    })}
                    {selectedCels.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedCels.length - 3} autres
                      </Badge>
                    )}
                  </div>
                )}
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Statut: {selectedStatus === ImportStatus.N ? 'En attente' : 
                             selectedStatus === ImportStatus.I ? 'Importé' : 
                             selectedStatus === ImportStatus.P ? 'Publié' : selectedStatus}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Effacer
              </Button>
            )}
            
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, page: 1 })}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
