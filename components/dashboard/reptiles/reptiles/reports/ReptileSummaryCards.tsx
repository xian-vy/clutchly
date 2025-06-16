'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReptileReportData } from '@/app/api/reptiles/reports';
import {  Scale, DollarSign, TrendingUp, Turtle } from 'lucide-react';

interface ReptileSummaryCardsProps {
  data: ReptileReportData;
}

export function ReptileSummaryCards({ data }: ReptileSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
          <Turtle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalReptiles}</div>
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
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${data.breedingStats.totalBreeders > 0 
              ? (data.breedingStats.totalBreeders * 1000 / data.breedingStats.totalBreeders).toFixed(0)
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
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
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
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
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