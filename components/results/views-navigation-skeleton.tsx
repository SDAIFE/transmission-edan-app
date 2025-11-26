'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Table } from 'lucide-react';

export function ViewsNavigationSkeleton() {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            disabled
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </Button>
          <Button
            variant="outline"
            disabled
            className="flex items-center gap-2"
          >
            <Table className="h-4 w-4" />
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
