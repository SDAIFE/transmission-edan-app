'use client';

import { PublicationsStatsCards } from './publications-stats-cards';
import type { PublicationsStatsSectionProps } from '@/types/publications';

export function PublicationsStatsSection({ stats, loading }: PublicationsStatsSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📊 Statistiques des Départements</h2>
      <PublicationsStatsCards stats={stats} loading={loading} />
    </div>
  );
}
