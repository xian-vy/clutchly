'use client';

import * as React from "react";
import { addDays, format, addMonths,  startOfQuarter, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

interface TimeRangeSelectorProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

export function TimeRangeSelector({
  dateRange,
  onDateRangeChange,
  period,
  onPeriodChange,
  className,
}: TimeRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(dateRange);

  // Handle period change and set appropriate date range
  const handlePeriodChange = (newPeriod: TimePeriod) => {
    onPeriodChange(newPeriod);
    
    const today = new Date();
    let from: Date;
    let to = today;
    
    switch (newPeriod) {
      case 'weekly':
        from = addDays(today, -7);
        break;
      case 'monthly':
        from = addMonths(today, -1);
        break;
      case 'quarterly':
        from = startOfQuarter(today);
        break;
      case 'yearly':
        from = startOfYear(today);
        break;
      case 'custom':
        // Keep existing date range if available, otherwise set last 30 days
        if (dateRange?.from && dateRange?.to) {
          from = dateRange.from;
          to = dateRange.to;
        } else {
          from = addDays(today, -30);
        }
        setIsCalendarOpen(true);
        break;
      default:
        from = addDays(today, -30);
    }
    
    setTempRange({ from, to });
    onDateRangeChange({ from, to });
  };

  // Apply default range when component mounts
  React.useEffect(() => {
    if (!dateRange) {
      handlePeriodChange('monthly');
    }
  }, []);

  // Handle applying the selected date range
  const handleApplyDateRange = () => {
    if (tempRange) {
      onDateRangeChange(tempRange);
    }
    setIsCalendarOpen(false);
  };

  // Format the date range for display
  const formatDateRangeDisplay = () => {
    if (period !== 'custom') {
      return period.charAt(0).toUpperCase() + period.slice(1);
    }
    
    if (!dateRange?.from) return 'Custom range';
    
    if (dateRange.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    }
    
    return format(dateRange.from, "MMM dd, yyyy");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex gap-2 items-center">
        <Select 
          value={period} 
          onValueChange={(value: TimePeriod) => handlePeriodChange(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        
        {period === 'custom' && (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                size="sm"
                className={cn(
                  "justify-start text-left font-normal min-w-[180px] truncate",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{formatDateRangeDisplay()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempRange?.from ?? new Date()}
                selected={tempRange}
                onSelect={setTempRange}
                numberOfMonths={2}
                className="max-w-full overflow-auto"
              />
              <div className="p-3 border-t flex justify-end">
                <Button 
                  size="sm"
                  onClick={handleApplyDateRange}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
} 