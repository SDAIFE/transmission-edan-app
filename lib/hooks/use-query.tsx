import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

// Configuration du QueryClient
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: (failureCount, error: unknown) => {
        // Ne pas retry sur les erreurs 4xx
        const errorObj = error as { response?: { status?: number } };
        if (errorObj?.response?.status && errorObj.response.status >= 400 && errorObj.response.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Provider pour TanStack Query
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Clés de requête communes
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
    verify: ['auth', 'verify'] as const,
  },
  dashboard: {
    stats: (role: string) => ['dashboard', 'stats', role] as const,
    cels: (filters?: Record<string, unknown>) => ['dashboard', 'cels', filters] as const,
  },
  cels: {
    all: (filters?: Record<string, unknown>) => ['cels', 'list', filters] as const,
    byCode: (code: string) => ['cels', 'detail', code] as const,
    stats: ['cels', 'stats'] as const,
    byDepartement: (code: string) => ['cels', 'departement', code] as const,
    byRegion: (code: string) => ['cels', 'region', code] as const,
    unassigned: ['cels', 'unassigned'] as const,
    byType: (type: string) => ['cels', 'type', type] as const,
  },
  departements: {
    all: (filters?: Record<string, unknown>) => ['departements', 'list', filters] as const,
    byCode: (code: string) => ['departements', 'detail', code] as const,
    stats: ['departements', 'stats'] as const,
    byRegion: (code: string) => ['departements', 'region', code] as const,
  },
  users: {
    all: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
    byId: (id: string) => ['users', 'detail', id] as const,
  },
  upload: {
    imports: (filters?: Record<string, unknown>) => ['upload', 'imports', filters] as const,
    stats: ['upload', 'stats'] as const,
    byCel: (code: string) => ['upload', 'cel', code] as const,
    byStatus: (status: string) => ['upload', 'status', status] as const,
  },
} as const;

// Hook utilitaire pour la pagination
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => Math.max(1, prev - 1));
  const goToPage = (newPage: number) => setPage(Math.max(1, newPage));
  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  };
};

// Hook utilitaire pour les filtres
export const useFilters = <T extends Record<string, unknown>>(initialFilters: T) => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (newFilters: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const clearFilters = () => {
    setFilters({} as T);
  };

  return {
    filters,
    setFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilters,
  };
};