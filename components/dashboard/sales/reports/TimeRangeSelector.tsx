'use client';

import { 
  Calendar, 
  CalendarRange, 
  Clock4, 
  ClockIcon,
  CalendarIcon
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

interface TimeRangeSelectorProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
  dateRange?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}

export function TimeRangeSelector({ value, onChange, dateRange, onDateChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Button
        variant={value === "weekly" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => onChange('weekly')}
      >
        <Clock4 className="h-3 w-3" />
        Weekly
      </Button>
      <Button
        variant={value === "monthly" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => onChange('monthly')}
      >
        <Calendar className="h-3 w-3" />
        Monthly
      </Button>
      <Button
        variant={value === "quarterly" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => onChange('quarterly')}
      >
        <CalendarRange className="h-3 w-3" />
        Quarterly
      </Button>
      <Button
        variant={value === "yearly" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => onChange('yearly')}
      >
        <ClockIcon className="h-3 w-3" />
        Yearly
      </Button>
      
      {/* Custom Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={value === "custom" ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex items-center gap-1 text-xs",
              !dateRange && value === "custom" && "text-muted-foreground"
            )}
            onClick={() => onChange('custom')}
          >
            <CalendarIcon className="h-3 w-3" />
            {value === "custom" && dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                </>
              ) : (
                format(dateRange.from, "MMM dd, yyyy")
              )
            ) : (
              "Custom Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateChange}
            numberOfMonths={2}
            disabled={value !== 'custom'}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 