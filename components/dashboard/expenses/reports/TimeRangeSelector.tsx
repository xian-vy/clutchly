'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface TimeRangeSelectorProps {
  value?: TimePeriod;
  onChange?: (value: TimePeriod) => void;
  dateRange?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  
  // Alternative props naming to support ExpenseReportTab
  timePeriod?: TimePeriod;
  onTimePeriodChange?: (value: TimePeriod) => void;
  onDateRangeChange?: (date: DateRange | undefined) => void;
}

export function TimeRangeSelector({ 
  value, 
  onChange, 
  dateRange, 
  onDateChange,
  // Support for alternative prop names
  timePeriod,
  onTimePeriodChange,
  onDateRangeChange
}: TimeRangeSelectorProps) {
  // Use the prop that is provided (prefer the original naming)
  const actualTimePeriod = value || timePeriod || 'monthly';
  const handleTimePeriodChange = onChange || onTimePeriodChange || (() => {});
  const handleDateRangeChange = onDateChange || onDateRangeChange || (() => {});

  return (
    <div className="flex items-center gap-2">
      <Select value={actualTimePeriod} onValueChange={handleTimePeriodChange}>
        <SelectTrigger className="w-[140px] !h-8 dark:border-none">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range */}
      {actualTimePeriod === 'custom' && (
        <Popover modal>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-1 text-xs",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                "Pick dates"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
} 