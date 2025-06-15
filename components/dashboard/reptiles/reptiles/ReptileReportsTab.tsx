'use client';

import { Button } from '@/components/ui/button';
import { Card,  } from '@/components/ui/card';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReptileReportData } from '@/app/api/reptiles/reports';
import { Loader2, Filter } from 'lucide-react';
import { ReptileFilterDialog } from './ReptileFilterDialog';
import { ReptileSummaryCards } from './reports/ReptileSummaryCards';
import { ReptileCharts } from './reports/ReptileCharts';
import { ReptileFilters } from './ReptileFilterDialog';

export function ReptileReportsTab() {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ReptileFilters>({});

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reptile-reports', filters],
    queryFn: () => getReptileReportData({
      startDate: filters.acquisitionDateRange?.[0],
      endDate: filters.acquisitionDateRange?.[1]
    })
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-start text-muted-foreground">Reptile Collection Reports</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comprehensive analysis of your reptile collection.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setFilterDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <ReptileFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />

      {isLoading ? (
        <Card className="flex items-center justify-center p-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </Card>
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