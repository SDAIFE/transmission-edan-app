'use client';

import { NavigationSkeleton } from './navigation-skeleton';
import { CandidatesSectionSkeleton } from './candidates-section-skeleton';
import { ChartsSectionSkeleton } from './charts-section-skeleton';

export function OverviewViewSkeleton() {
  return (
    <div className="space-y-8 p-2">
      {/* Section des candidats - Squelette */}
      <CandidatesSectionSkeleton />

      {/* Section graphiques - Squelette */}
      <ChartsSectionSkeleton />
    </div>
  );
}
