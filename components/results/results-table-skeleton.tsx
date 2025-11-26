'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function ResultsTableSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
