'use client';

import { 
  Calendar, 
  CalendarRange, 
  Clock4, 
  ClockIcon
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface TimeRangeSelectorProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(val) => onChange(val as TimePeriod)} className="w-fit">
      <TabsList>
        <TabsTrigger value="weekly" className="flex items-center gap-1 text-xs">
          <Clock4 className="h-3 w-3" />
          Weekly
        </TabsTrigger>
        <TabsTrigger value="monthly" className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          Monthly
        </TabsTrigger>
        <TabsTrigger value="quarterly" className="flex items-center gap-1 text-xs">
          <CalendarRange className="h-3 w-3" />
          Quarterly
        </TabsTrigger>
        <TabsTrigger value="yearly" className="flex items-center gap-1 text-xs">
          <ClockIcon className="h-3 w-3" />
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 