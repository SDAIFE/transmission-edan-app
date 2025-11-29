// Hook personnalisé pour la gestion des listes simples (circonscriptions et CELs)
// ✅ ARCHITECTURE : Selon le guide PROMPT_FRONTEND_LISTES_SIMPLES.md

import { useState, useEffect, useCallback } from 'react';
import { listsApi, type SimpleCirconscription, type SimpleCel } from '@/lib/api/lists';
import { handleApiError } from '@/lib/api/client';

interface UseSimpleListsReturn {
  circonscriptions: SimpleCirconscription[];
  cels: SimpleCel[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les listes simples (circonscriptions et CELs)
 * 
 * Caractéristiques :
 * - Gestion d'état complète (loading, error, data)
 * - Chargement automatique au montage
 * - Fonction de rechargement manuel
 * - Gestion automatique des erreurs avec handleApiError
 * - Chargement en parallèle des deux listes
 * 
 * @returns État et fonctions pour gérer les listes simples
 */
export function useSimpleLists(): UseSimpleListsReturn {
  const [circonscriptions, setCirconscriptions] = useState<SimpleCirconscription[]>([]);
  const [cels, setCels] = useState<SimpleCel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Charger les deux listes en parallèle
      const [circonscriptionsData, celsData] = await Promise.all([
        listsApi.getCirconscriptionsList(),
        listsApi.getCelsList(),
      ]);
      
      setCirconscriptions(circonscriptionsData);
      setCels(celsData);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [useSimpleLists] Erreur lors de la récupération:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    circonscriptions,
    cels,
    loading,
    error,
    refetch: fetchLists,
  };
}

