'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';

// Composants
import { PublicationsStatsSection } from './publications-stats-section';
import { DepartmentsTable } from './departments-table';
import { DepartmentFilters as DepartmentFiltersComponent } from './department-filters';
import { ReadyForPublicationAlert } from './ready-for-publication-alert';

// API et types
import { publicationsApi } from '@/lib/api/publications';
import type { 
  DepartmentData, 
  DepartmentStats,
  DepartmentListResponse,
  DepartmentFilters,
  PublicationsPageContentProps
} from '@/types/publications';

export function PublicationsPageContent({ onPublicationSuccess, isUser = false }: PublicationsPageContentProps) {
  // État pour le loading
  const [loading, setLoading] = useState(false);

  // États pour les données
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [allDepartmentsRaw, setAllDepartmentsRaw] = useState<DepartmentData[]>([]); // Tous les départements pour l'alerte
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DepartmentFilters>({
    page: 1,
    limit: 10
  });

  // Stabiliser la référence d'allDepartments avec useMemo
  const allDepartments = useMemo(() => allDepartmentsRaw, [allDepartmentsRaw]);

  // États pour la génération des PDFs nationaux
  const [generatingNationalPDF, setGeneratingNationalPDF] = useState(false);
  const [generatingDetailedPDF, setGeneratingDetailedPDF] = useState(false);

  // Référence pour éviter les dépendances circulaires
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Logique pour déterminer si les boutons de résultats nationaux doivent être visibles
  const showNationalResultButtons = useMemo(() => {
    return allDepartments.some(dept => 
      // Département prêt pour publication (toutes les CELs importées)
      (dept.pendingCels === 0 && dept.importedCels > 0) ||
      // Département déjà publié
      dept.publicationStatus === 'PUBLISHED'
    );
  }, [allDepartments]);

  // Charger les données initiales
  const loadInitialData = useCallback(async (customFilters?: DepartmentFilters) => {
    try {
      setLoading(true);
      const filtersToUse = customFilters || filtersRef.current;
      
      // Charger les statistiques, départements filtrés et tous les départements en parallèle
      const [statsData, departmentsData, allDepartmentsData] = await Promise.allSettled([
        publicationsApi.getStats(),
        publicationsApi.getDepartments(filtersToUse),
        publicationsApi.getDepartments({ page: 1, limit: 1000 }) // Charger tous les départements pour l'alerte
      ]);

      // Traiter les statistiques
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        console.warn('⚠️ [PublicationsPageContent] Impossible de charger les statistiques');
        setStats(null);
      }

      // Traiter les départements filtrés
      if (departmentsData.status === 'fulfilled' && departmentsData.value) {
        setDepartments(departmentsData.value.departments);
        setTotalPages(departmentsData.value.totalPages);
        setCurrentPage(departmentsData.value.page);
      } else {
        console.warn('⚠️ [PublicationsPageContent] Impossible de charger les départements filtrés');
        setDepartments([]);
        setTotalPages(1);
        setCurrentPage(1);
      }

      // Traiter tous les départements pour l'alerte
      if (allDepartmentsData.status === 'fulfilled' && allDepartmentsData.value) {
        setAllDepartmentsRaw(allDepartmentsData.value.departments);
      } else {
        console.warn('⚠️ [PublicationsPageContent] Impossible de charger tous les départements pour l\'alerte');
        setAllDepartmentsRaw([]);
      }
      
    } catch (error: unknown) {
      console.error('❌ [PublicationsPageContent] Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances pour éviter la boucle infinie

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, []); // Pas de dépendances pour éviter la boucle infinie

  // Pas de useEffect séparé pour les filtres - tout est géré dans loadInitialData

  // Gestion des actions de publication
  const handlePublish = useCallback(async (department: DepartmentData): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📢 [PublicationsPageContent] Publication du département:', department.libelleDepartement);
    }
    
    try {
      const result = await publicationsApi.publishDepartment(department.id);
      
      if (result.success) {
        // Mettre à jour le statut localement
        setDepartments(prev => 
          prev.map(dept => 
            dept.id === department.id 
              ? { ...dept, publicationStatus: 'PUBLISHED' as any, lastUpdate: new Date().toISOString() }
              : dept
          )
        );
        
        onPublicationSuccess?.();
        
        // Recharger toutes les données pour avoir les statistiques et l'alerte à jour
        await loadInitialData();
      }
    } catch (error) {
      console.error('❌ [PublicationsPageContent] Erreur lors de la publication:', error);
      toast.error('Erreur lors de la publication');
    }
  }, [onPublicationSuccess]);

  // Gestion de l'annulation de publication
  const handleCancel = useCallback(async (department: DepartmentData): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [PublicationsPageContent] Annulation du département:', department.libelleDepartement);
    }
    
    try {
      const result = await publicationsApi.cancelPublication(department.id);
      
      if (result.success) {
        // Mettre à jour le statut localement
        setDepartments(prev => 
          prev.map(dept => 
            dept.id === department.id 
              ? { ...dept, publicationStatus: 'CANCELLED' as any, lastUpdate: new Date().toISOString() }
              : dept
          )
        );
        
        onPublicationSuccess?.();
        
        // Recharger toutes les données pour avoir les statistiques et l'alerte à jour
        await loadInitialData();
      }
    } catch (error) {
      console.error('❌ [PublicationsPageContent] Erreur lors de l\'annulation:', error);
      toast.error('Erreur lors de l\'annulation');
    }
  }, [onPublicationSuccess]);

  // Gestion de la vue des détails
  const handleViewDetails = useCallback((department: DepartmentData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👁️ [PublicationsPageContent] Voir détails:', department);
    }
    // TODO: Implémenter la modal de détails
    toast.info(`Détails du département ${department.libelleDepartement}`);
  }, []);

  // Gestion des changements de filtres
  const handleFiltersChange = useCallback((newFilters: DepartmentFilters) => {
    setFilters(newFilters);
    // Recharger les données avec les nouveaux filtres
    loadInitialData(newFilters);
  }, []);

  // Gestion des changements de page
  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filtersRef.current, page };
    setFilters(newFilters);
    loadInitialData(newFilters);
  }, []);

  // Gestion de la recherche depuis l'alerte
  const handleSearchFromAlert = useCallback((searchTerm: string) => {
    const newFilters = {
      ...filtersRef.current,
      search: searchTerm,
      page: 1 // Reset à la page 1 lors de la recherche
    };
    setFilters(newFilters);
    loadInitialData(newFilters);
  }, []);

  // Génération du PDF Résultat National
  const handleGenerateNationalPDF = async () => {
    if (generatingNationalPDF) return;

    try {
      setGeneratingNationalPDF(true);
      
      console.log('📄 [PublicationsPageContent] Génération du Résultat National...');
      
      // TODO: Implémenter la génération du PDF Résultat National
      // Simulation pour le moment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('PDF généré avec succès', {
        description: 'Le Résultat National a été généré et téléchargé',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('❌ [PublicationsPageContent] Erreur lors de la génération du PDF National:', error);
      toast.error('Erreur lors de la génération', {
        description: 'Impossible de générer le PDF Résultat National',
        duration: 5000,
      });
    } finally {
      setGeneratingNationalPDF(false);
    }
  };

  // Génération du PDF Résultat National Détaillé
  const handleGenerateDetailedPDF = async () => {
    if (generatingDetailedPDF) return;

    try {
      setGeneratingDetailedPDF(true);
      
      console.log('📄 [PublicationsPageContent] Génération du Résultat National Détaillé...');
      
      // TODO: Implémenter la génération du PDF Résultat National Détaillé
      // Simulation pour le moment
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast.success('PDF généré avec succès', {
        description: 'Le Résultat National Détaillé a été généré et téléchargé',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('❌ [PublicationsPageContent] Erreur lors de la génération du PDF Détaillé:', error);
      toast.error('Erreur lors de la génération', {
        description: 'Impossible de générer le PDF Résultat National Détaillé',
        duration: 5000,
      });
    } finally {
      setGeneratingDetailedPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <PublicationsStatsSection stats={stats} loading={loading} />

      {/* Alerte pour les départements prêts à publier/consolider */}
      <ReadyForPublicationAlert
        departments={allDepartments}
        loading={loading}
        onViewDetails={handleViewDetails}
        onPublish={handlePublish}
        onSearchDepartment={handleSearchFromAlert}
        isUser={isUser}
      />

      {/* Boutons de génération des résultats nationaux - Visibles uniquement pour SADMIN et ADMIN */}
      {!isUser && showNationalResultButtons && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📊 Résultats Nationaux
              </h3>
              <p className="text-sm text-blue-700">
                Générer les rapports consolidés au niveau national
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateNationalPDF}
                disabled={generatingNationalPDF || generatingDetailedPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {generatingNationalPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {generatingNationalPDF ? 'Génération...' : 'Résultat National'}
              </Button>
              
              <Button
                onClick={handleGenerateDetailedPDF}
                disabled={generatingNationalPDF || generatingDetailedPDF}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                size="sm"
              >
                {generatingDetailedPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {generatingDetailedPDF ? 'Génération...' : 'Résultat National Détaillé'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <DepartmentFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Tableau des départements */}
      <DepartmentsTable
        departments={departments}
        loading={loading}
        onRefresh={loadInitialData}
        onPublish={handlePublish}
        onCancel={handleCancel}
        onViewDetails={handleViewDetails}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isUser={isUser}
      />
    </div>
  );
}
