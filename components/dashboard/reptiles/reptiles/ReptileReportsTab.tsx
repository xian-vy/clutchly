'use client';

import { Card,  } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getReptileReportData } from '@/app/api/reptiles/reports';
import { Loader2 } from 'lucide-react';
import { ReptileSummaryCards } from './reports/ReptileSummaryCards';
import { ReptileCharts } from './reports/ReptileCharts';

export function ReptileReportsTab() {

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reptile-reports'],
    queryFn: getReptileReportData
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg  font-semibold tracking-tight text-start text-muted-foreground">Reptile Collection Reports</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comprehensive analysis of your reptile collection.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : reportData ? (
        <div className="space-y-4">
          <ReptileSummaryCards data={reportData} />
          <ReptileCharts data={reportData} />
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for the selected period.</p>
        </Card>
      )}
    </div>
  );
}