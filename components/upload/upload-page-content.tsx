'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

// Composants
import { StatsSection } from './stats-section';
import { ImportsSection } from './imports-section';
import { UploadModal } from './upload-modal';

// API et types
import { uploadApi, listsApi } from '@/lib/api';
import type { 
  ImportData, 
  ImportStats,
  ImportFilters as ImportFiltersType
} from '@/types/upload';

interface UploadPageContentProps {
  onUploadSuccess?: () => void;
}

export function UploadPageContent({ onUploadSuccess }: UploadPageContentProps) {
  // Log pour détecter les re-renders
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [UploadPageContent] RENDER');
  }

  // États pour les données
  const [imports, setImports] = useState<ImportData[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [filters, setFilters] = useState<ImportFiltersType>({ page: 1, limit: 10 });
  
  // ✅ NOUVEAU : États pour la pagination
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [loading, setLoading] = useState(false);
  const [availableCels, setAvailableCels] = useState<{ codeCellule: string; libelleCellule: string }[]>([]);
  const [availableRegions, setAvailableRegions] = useState<{ codeRegion: string; libelleRegion: string }[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<{ codeDepartement: string; libelleDepartement: string }[]>([]);
  
  // État pour le modal d'upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fonction de chargement des données - sans useCallback
  const loadData = async (newFilters?: ImportFiltersType) => {
    try {
      setLoading(true);
      
      const filtersToUse = newFilters || filters;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [UploadPageContent] Chargement avec filtres:', filtersToUse);
      }
      
      // Charger les données en parallèle, mais gérer les erreurs individuellement
      const [statsData, importsData, listsData] = await Promise.allSettled([
        uploadApi.getStats(),
        uploadApi.getImports(filtersToUse),
        listsApi.getFormLists()
      ]);

      // Traiter les statistiques (peuvent être null si pas de permissions)
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        console.warn('⚠️ [UploadPageContent] Statistiques non disponibles:', statsData.reason);
        setStats(null);
      }

      // Traiter les imports
      if (importsData.status === 'fulfilled') {
        if (importsData.value === null) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [UploadPageContent] Imports non disponibles (permissions insuffisantes)');
          }
          setImports([]);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 [UploadPageContent] Imports chargés:', importsData.value.imports.length, 'éléments');
          }
          setImports(importsData.value.imports);
          
          // ✅ NOUVEAU : Mettre à jour les états de pagination
          if (importsData.value.total !== undefined) {
            setTotal(importsData.value.total);
          }
          if (importsData.value.page !== undefined) {
            setCurrentPage(importsData.value.page);
          }
          if (importsData.value.totalPages !== undefined) {
            setTotalPages(importsData.value.totalPages);
          }
        }
      }

      // Traiter les CELs, Régions et Départements
      if (listsData.status === 'fulfilled') {
        setAvailableCels(listsData.value.cels);
        setAvailableRegions(listsData.value.regions || []);
        setAvailableDepartments(listsData.value.departements || []);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 [UploadPageContent] Listes chargées:', {
            cels: listsData.value.cels.length,
            regions: listsData.value.regions?.length || 0,
            departements: listsData.value.departements?.length || 0,
          });
        }
      } else {
        console.error('❌ [UploadPageContent] Erreur lors du chargement des listes:', listsData.reason);
        toast.error('Erreur lors du chargement des listes');
      }
      
    } catch (error: unknown) {
      console.error('❌ [UploadPageContent] Erreur générale lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage - une seule fois
  useEffect(() => {
    loadData();
  }, []); // Pas de dépendances pour éviter la boucle infinie

  // Gestion du succès d'upload
  const handleUploadSuccess = () => {
    if (process.env.NODE_ENV === 'development') {
    console.log('🔄 [UploadPageContent] Upload réussi, rechargement des données...');
    }
    loadData();
    setIsUploadModalOpen(false); // Fermer le modal
    onUploadSuccess?.();
  };

  // Gestion des changements de filtres
  const handleFiltersChange = (newFilters: ImportFiltersType) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [UploadPageContent] Changement de filtres:', newFilters);
    }
    
    // Mettre à jour les filtres locaux
    setFilters(newFilters);
    
    // Recharger les données avec les nouveaux filtres
    loadData(newFilters);
  };

  // ✅ NOUVEAU : Gestion du changement de page
  const handlePageChange = (page: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 [UploadPageContent] Changement de page:', page);
    }
    
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadData(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <StatsSection stats={stats} loading={loading} />

      {/* Bouton pour ouvrir le modal d'upload */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2"
          size="lg"
        >
          <Upload className="h-5 w-5" />
          Nouvel import Excel
        </Button>
      </div>

      {/* Section Imports */}
      <ImportsSection 
        imports={imports}
        availableCels={availableCels}
        availableRegions={availableRegions}
        availableDepartments={availableDepartments}
        onRefresh={() => loadData(filters)}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal d'upload */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
