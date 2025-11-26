'use client';

import { ChartSkeleton } from './chart-skeleton';
import { PieChart, BarChart3 } from 'lucide-react';

export function ChartsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton title="Répartition des voix" icon={PieChart} />
      <ChartSkeleton title="Scores" icon={BarChart3} />
    </div>
  );
}
