'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, Filter } from 'lucide-react';
import { FiltersSkeleton } from './filters-skeleton';
import { ResultsTableSkeleton } from './results-table-skeleton';

export function TableViewSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-6" />
        
        {/* Interface de filtres - Squelette */}
        <FiltersSkeleton />

        {/* Zone de résultats - Squelette */}
        <ResultsTableSkeleton />
      </div>
    </div>
  );
}
