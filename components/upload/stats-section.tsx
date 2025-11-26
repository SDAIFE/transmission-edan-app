'use client';

import { StatsCards } from './stats-cards';
import type { ImportStats } from '@/types/upload';

interface StatsSectionProps {
  stats: ImportStats | null;
  loading: boolean;
}

export function StatsSection({ stats, loading }: StatsSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📊 Statistiques</h2>
      <StatsCards stats={stats} loading={loading} />
    </div>
  );
}
