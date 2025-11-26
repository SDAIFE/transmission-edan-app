'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Composants
import { ImportFilters } from './import-filters';
import { ImportsTable } from './imports-table';

// API et types
import { uploadApi } from '@/lib/api';
import type { 
  ImportData, 
  ImportFilters as ImportFiltersType
} from '@/types/upload';
import { ImportStatus } from '@/types/upload';

interface ImportsSectionProps {
  imports?: ImportData[];
  availableCels: { codeCellule: string; libelleCellule: string }[];
  availableRegions?: { codeRegion: string; libelleRegion: string }[];
  availableDepartments?: { codeDepartement: string; libelleDepartement: string }[];
  onRefresh?: () => void;
  onFiltersChange?: (filters: ImportFiltersType) => void;
  loading?: boolean;
  // ✅ NOUVEAU : Props de pagination
  total?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ImportsSection({ 
  imports: propsImports, 
  availableCels, 
  availableRegions = [], 
  availableDepartments = [], 
  onRefresh, 
  onFiltersChange, 
  loading: propsLoading,
  // ✅ NOUVEAU : Props de pagination
  total,
  currentPage,
  totalPages,
  onPageChange
}: ImportsSectionProps) {
  // États pour les imports
  const [imports, setImports] = useState<ImportData[]>([]);
  const [filters, setFilters] = useState<ImportFiltersType>({ page: 1, limit: 10 });
  const [importsLoading, setImportsLoading] = useState(false);

  // Fonction pour mapper les statuts du backend vers notre enum
  const mapBackendStatusToFrontend = (backendStatus: string): ImportStatus => {
    switch (backendStatus) {
      case 'N':
        return ImportStatus.N;
      case 'I':
        return ImportStatus.I;
      case 'P':
        return ImportStatus.P;
      case 'COMPLETED': // Si le backend retourne COMPLETED pour I ou P
        return ImportStatus.I; // Par défaut, considérer comme Importé
      default:
        console.warn('🔍 [ImportsSection] Statut inconnu:', backendStatus);
        return ImportStatus.N; // Par défaut, considérer comme En attente
    }
  };

  // Fonction pour mapper les données du backend vers notre interface
  const mapBackendDataToFrontend = (backendData: any): ImportData => { // TODO: check if this is needed
    return {
      id: backendData.id || '',
      codeCellule: backendData.codeCellule || '',
      nomFichier: backendData.nomFichier || '', // Le backend envoie déjà le bon nom
      statutImport: mapBackendStatusToFrontend(backendData.statutImport),
      messageErreur: backendData.messageErreur,
      // Le backend ne semble pas envoyer de date, utilisons la date actuelle
      dateImport: backendData.dateImport || new Date().toISOString(),
      // Le backend envoie nombreLignesImportees: 0 (probablement correct)
      nombreLignesImportees: backendData.nombreLignesImportees || 0,
      nombreLignesEnErreur: backendData.nombreLignesEnErreur || 0,
      nombreBureauxVote: backendData.nombreBureauxVote || 0,
      details: backendData.details || {
        headers: [],
        colonnesMappees: {},
        lignesTraitees: backendData.nombreLignesImportees || 0,
        lignesReussies: backendData.nombreLignesImportees || 0,
        lignesEchouees: backendData.nombreLignesEnErreur || 0,
      },
      // ✨ NOUVEAU : Informations géographiques
      departement: backendData.departement,
      region: backendData.region,
      // ✨ NOUVEAU : Informations de l'utilisateur qui a importé
      importePar: backendData.importePar,
    };
  };

  // Charger les imports avec filtres - sans useCallback
  const loadImports = async (newFilters: ImportFiltersType) => {
    try {
      setImportsLoading(true);
      const response = await uploadApi.getImports(newFilters);
      
      if (response === null) {
        console.warn('⚠️ [ImportsSection] Imports non disponibles (permissions insuffisantes)');
        setImports([]);
        return;
      }
      
      // Mapper les données du backend vers notre interface
      const mappedImports = response.imports.map(mapBackendDataToFrontend);
      
      setImports(mappedImports);
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des imports:', error);
      toast.error('Erreur lors du chargement des imports');
    } finally {
      setImportsLoading(false);
    }
  };

  // Utiliser les imports passés en props ou charger localement
  useEffect(() => {
    if (propsImports) {
      // Utiliser les imports passés en props
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 [ImportsSection] Utilisation des imports en props:', {
          count: propsImports.length,
          imports: propsImports.map(i => ({ id: i.id, codeCellule: i.codeCellule, nomFichier: i.nomFichier }))
        });
      }
      setImports(propsImports);
    } else {
      // Charger les imports localement si pas fournis en props
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 [ImportsSection] Chargement local des imports...');
      }
      loadImports({ page: 1, limit: 10 });
    }
  }, [propsImports]); // Seulement dépendre de propsImports pour éviter la boucle

  // Synchroniser les filtres avec les props
  useEffect(() => {
    if (propsImports) {
      // Si on reçoit des imports en props, on n'a pas besoin de gérer les filtres localement
      // Les filtres sont gérés par le parent (UploadPageContent)
      return;
    }
  }, [propsImports]);

  // Gestion des changements de filtres
  const handleFiltersChange = (newFilters: ImportFiltersType) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [ImportsSection] Changement de filtres:', newFilters);
    }
    
    // Toujours mettre à jour les filtres locaux
    setFilters(newFilters);
    
    // Si on a une fonction onFiltersChange du parent, l'utiliser (mode props)
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    } else {
      // Mode autonome : charger localement
      loadImports(newFilters);
    }
  };

  // Actions sur les imports
  const handleViewDetails = (importData: ImportData) => {
    // TODO: Implémenter la modal de détails
    if (process.env.NODE_ENV === 'development') {
      console.log('Voir détails:', importData);
    }
  };

  const handleDownload = async (importData: ImportData) => {
    try {
      const blob = await uploadApi.downloadImport(importData.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = importData.nomFichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (importData: ImportData) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'import "${importData.nomFichier}" ?`)) {
      try {
        await uploadApi.deleteImport(importData.id);
        toast.success('Import supprimé avec succès');
        onRefresh?.();
      } catch (error: unknown) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleRefresh = () => {
    // Si onRefresh est fourni (depuis UploadPageContent), l'utiliser
    // Sinon, recharger seulement les imports locaux
    if (onRefresh) {
      console.log('🔄 [ImportsSection] Rafraîchissement via onRefresh...');
      onRefresh();
    } else {
      console.log('🔄 [ImportsSection] Rafraîchissement local des imports...');
      loadImports(filters);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📋 Imports</h2>
      
      {/* Filtres */}
      <ImportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableCels={availableCels}
        availableRegions={availableRegions}
        availableDepartments={availableDepartments}
        imports={imports}
        loading={propsLoading || importsLoading}
      />

      {/* Tableau des imports */}
      <ImportsTable
        imports={imports}
        loading={propsLoading || importsLoading}
        onRefresh={handleRefresh}
        onViewDetails={handleViewDetails}
        // ✅ NOUVEAU : Props de pagination
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
