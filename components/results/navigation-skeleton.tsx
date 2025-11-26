'use client';

import { Card, CardContent } from '@/components/ui/card';

export function NavigationSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
