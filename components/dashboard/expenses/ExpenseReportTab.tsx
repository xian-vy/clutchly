'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FilterX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { getExpensesByCategory, getExpensesSummary } from '@/app/api/expenses';
import { ExpensesSummaryStats } from './reports/ExpensesSummaryStats';
import { ExpensesByTimeChart } from './reports/charts/ExpensesByTimeChart';
import { DistributionPieCharts } from './reports/charts/DistributionPieCharts';
import { TimePeriod, TimeRangeSelector } from './reports/TimeRangeSelector';

interface ExpensesFilterParams {
  period?: TimePeriod;
  startDate?: string;
  endDate?: string;
}

export function ExpenseReportTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ExpensesFilterParams>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  
  // Handle time period change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    
    // If custom period selected, don't update filters yet
    // Wait for date range selection
    if (period !== 'custom') {
      setDateRange(undefined);
      setFilters(prev => ({
        ...prev,
        period,
        startDate: undefined,
        endDate: undefined
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        period
      }));
    }
  };
  
  // Update filters when date range changes for custom period
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    
    if (timePeriod === 'custom' && newRange) {
      const updatedFilters = { ...filters };
      
      if (newRange.from) {
        updatedFilters.startDate = format(newRange.from, 'yyyy-MM-dd');
      } else {
        delete updatedFilters.startDate;
      }
      
      if (newRange.to) {
        updatedFilters.endDate = format(newRange.to, 'yyyy-MM-dd');
      } else {
        delete updatedFilters.endDate;
      }
      
      setFilters(updatedFilters);
    }
  };

  const handleResetFilters = () => {
    setFilters({});
    setDateRange(undefined);
    setTimePeriod('monthly');
  };

  // Fetch data
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['expenses-summary', filters],
    queryFn: () => getExpensesSummary(),
  });

  const { data: expensesByCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ['expenses-by-category', filters],
    queryFn: () => getExpensesByCategory(filters),
  });

  if (summaryLoading || categoryLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm lg:text-lg font-semibold tracking-tight text-start">Expenses Reports</h2>
            <p className="text-xs sm:text-sm text-start text-muted-foreground">
              Comprehensive analysis of your expense data and trends
            </p>
          </div>
          <div className="flex  gap-2">
            <TimeRangeSelector
              value={timePeriod}
              onChange={handleTimePeriodChange}
              dateRange={dateRange}
              onDateChange={handleDateRangeChange}
            />
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <FilterX className=" h-4 w-4" />
              Reset 
            </Button>
            </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}  className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {summary && <ExpensesSummaryStats summary={summary} />}
          {expensesByCategory && (
            <ExpensesByTimeChart
              data={expensesByCategory}
              period={timePeriod}
            />
          )}
        </TabsContent>

        <TabsContent value="distribution">
          {expensesByCategory && (
            <DistributionPieCharts
              data={expensesByCategory}
              period={timePeriod}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 