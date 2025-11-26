'use client';

import { ViewsNavigationSkeleton } from './views-navigation-skeleton';
import { OverviewViewSkeleton } from './overview-view-skeleton';

export function ResultsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Navigation des vues - Squelette */}
      <ViewsNavigationSkeleton />

      {/* Vue d'ensemble - Squelette */}
      <OverviewViewSkeleton />
    </div>
  );
}
