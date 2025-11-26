'use client';

import { ViewsNavigationSkeleton } from './views-navigation-skeleton';
import { OverviewViewSkeleton } from './overview-view-skeleton';
import { TableViewSkeleton } from './table-view-skeleton';

export function ResultsPageUltimateFinalSkeleton() {
  return (
    <div className="space-y-8">
      {/* Navigation des vues - Squelette */}
      <ViewsNavigationSkeleton />

      {/* Vue d'ensemble - Squelette */}
      <OverviewViewSkeleton />

      {/* Vue tableau - Squelette */}
      <TableViewSkeleton />
    </div>
  );
}
