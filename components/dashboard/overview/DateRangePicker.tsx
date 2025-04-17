'use client';

import * as React from "react";
import { addDays, format } from "date-fns";
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

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
  presets?: { label: string; days: number }[];
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "Last year", days: 365 },
  ],
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(dateRange);

  // Apply default range of 30 days if no range is selected
  React.useEffect(() => {
    if (!dateRange && !tempRange) {
      const end = new Date();
      const start = addDays(end, -30);
      setTempRange({ from: start, to: end });
      onDateRangeChange({ from: start, to: end });
    }
  }, [dateRange, onDateRangeChange, tempRange]);

  // Handle selecting a preset time period
  const handlePresetChange = (days: number) => {
    const end = new Date();
    const start = addDays(end, -days);
    setTempRange({ from: start, to: end });
    onDateRangeChange({ from: start, to: end });
  };

  // Handle applying the selected date range
  const handleApplyDateRange = () => {
    if (tempRange) {
      onDateRangeChange(tempRange);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h4 className="font-medium text-sm">Date Range</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setTempRange(undefined);
                    onDateRangeChange(undefined);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  onValueChange={(value) => handlePresetChange(parseInt(value))}
                  defaultValue="30"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Presets" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.days} value={preset.days.toString()}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tempRange?.from ?? new Date()}
            selected={tempRange}
            onSelect={setTempRange}
            numberOfMonths={2}
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
    </div>
  );
}