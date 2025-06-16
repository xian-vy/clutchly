'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFeedingReportData } from '@/app/api/feeding/reports';
import { FeedingFilterDialog } from './logs/FeedingFilterDialog';
import { SummaryCards } from './reports/SummaryCards';
import { FeedingCharts } from './reports/FeedingCharts';
import { Loader2, Filter } from 'lucide-react';

export function FeedingReportsTab() {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'fed' | 'unfed'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['feeding-reports', dateRange, filterStatus],
    queryFn: () => getFeedingReportData({
      startDate: dateRange.from?.toISOString(),
      endDate: dateRange.to?.toISOString()
    })
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
       <div>
          <h2 className="text-base sm:text-lg  font-semibold tracking-tight text-start text-muted-foreground">Feeding Reports</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comprehensive analysis of your feeding events.
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

      <FeedingFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {isLoading ? (
        <Card className="flex items-center justify-center p-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </Card>
      ) : reportData ? (
        <div className="space-y-4">
          <SummaryCards data={reportData} />
          <FeedingCharts data={reportData} />
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No data available for the selected period.</p>
        </Card>
      )}
    </div>
  );
}
