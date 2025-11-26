'use client';

import { ViewsNavigationSkeleton } from './views-navigation-skeleton';
import { TableViewSkeleton } from './table-view-skeleton';

export function TablePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Navigation des vues - Squelette */}
      <ViewsNavigationSkeleton />

      {/* Vue tableau - Squelette */}
      <TableViewSkeleton />
    </div>
  );
}
