'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';

export function FiltersSkeleton() {
  return (
    <Card className="border-0 shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>

          {/* Boutons d'action - Squelette */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
              <div className="h-4 w-20 bg-gray-200 rounded-lg animate-pulse" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
