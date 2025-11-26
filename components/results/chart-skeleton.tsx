'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ChartSkeletonProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ChartSkeleton({ title, icon: Icon }: ChartSkeletonProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gray-400" />
            <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mx-auto" />
            <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
