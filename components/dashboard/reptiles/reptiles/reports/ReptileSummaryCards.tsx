'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReptileReportData } from '@/app/api/reptiles/reports';
import {  Scale, DollarSign, TrendingUp, Turtle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ReptileSummaryCardsProps {
  data: ReptileReportData;
}

export function ReptileSummaryCards({ data }: ReptileSummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
           <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
             <Turtle className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{data.totalReptiles}</div>
          <p className="text-xs text-muted-foreground">
            {data.statusDistribution.map(status => 
              `${status.count} ${status.status}`
            ).join(', ')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Value</CardTitle>
          <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
             <DollarSign className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">
            {data.breedingStats.totalBreeders > 0 
              ? (formatPrice(data.breedingStats.totalBreeders * 1000 / data.breedingStats.totalBreeders))
              : '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Per reptile
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Breeders</CardTitle>
           <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
             <TrendingUp className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">
            {data.breedingStats.activeBreeders} / {data.breedingStats.totalBreeders}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.breedingStats.totalBreeders > 0 
              ? `${((data.breedingStats.activeBreeders / data.breedingStats.totalBreeders) * 100).toFixed(0)}% active`
              : 'No breeders'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Weight</CardTitle>
           <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
              <Scale className="h-4 w-4 text-foreground/80" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">
            {data.growthStats.averageWeight.toFixed(1)}g
          </div>
          <p className="text-xs text-muted-foreground">
            Across all reptiles
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 