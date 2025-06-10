'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getCurrentMonthDateRange } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface GrowthFilters {
  weightRange?: [number, number] | null;
  lengthRange?: [number, number] | null;
  dateRange?: [string, string] | null;
  hasNotes?: boolean | null;
  hasAttachments?: boolean | null;
}

const filterSchema = z.object({
  weightRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  lengthRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  dateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  hasNotes: z.boolean().nullable().optional(),
  hasAttachments: z.boolean().nullable().optional(),
});

interface GrowthFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: GrowthFilters) => void;
  currentFilters: GrowthFilters;
}

export function GrowthFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: GrowthFilterDialogProps) {
  const [weightRange, setWeightRange] = useState<[number, number]>(
    currentFilters.weightRange || [0, 50000]
  );
  
  const [lengthRange, setLengthRange] = useState<[number, number]>(
    currentFilters.lengthRange || [0, 1200]
  );

  const currentMonthRange = getCurrentMonthDateRange();
  const defaultFromDate = new Date(currentMonthRange.dateFrom);
  const defaultToDate = new Date(currentMonthRange.dateTo);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: currentFilters.dateRange ? new Date(currentFilters.dateRange[0]) : defaultFromDate,
    to: currentFilters.dateRange ? new Date(currentFilters.dateRange[1]) : defaultToDate,
  });

  const form = useForm<GrowthFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      weightRange: currentFilters.weightRange || null,
      lengthRange: currentFilters.lengthRange || null,
      dateRange: currentFilters.dateRange || [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      hasNotes: currentFilters.hasNotes || null,
      hasAttachments: currentFilters.hasAttachments || null,
    },
  });

  const validateDateRange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      const daysDiff = differenceInDays(to, from);
      if (daysDiff > 30) {
        toast.error('Date range cannot exceed 30 days');
        return false;
      }
    }
    return true;
  };

  const handleDateSelect = (date: Date | undefined, isFrom: boolean) => {
    if (!date) return;

    const newDateRange = {
      ...dateRange,
      [isFrom ? 'from' : 'to']: date
    };

    // If selecting "from" date, ensure "to" date is within 30 days
    if (isFrom && newDateRange.to) {
      const maxDate = addMonths(date, 1);
      if (newDateRange.to > maxDate) {
        newDateRange.to = maxDate;
      }
    }

    // If selecting "to" date, ensure it's not before "from" date
    if (!isFrom && newDateRange.from && date < newDateRange.from) {
      toast.error('End date cannot be before start date');
      return;
    }

    if (validateDateRange(newDateRange.from, newDateRange.to)) {
      setDateRange(newDateRange);
      form.setValue('dateRange', [
        newDateRange.from?.toISOString().split('T')[0] || '',
        newDateRange.to?.toISOString().split('T')[0] || ''
      ]);
    }
  };

  function onSubmit(values: GrowthFilters) {
    // If all values are null/undefined/empty, treat it as a reset
    const isReset = !values.weightRange && 
                   !values.lengthRange && 
                   !values.dateRange && 
                   values.hasNotes === null && 
                   values.hasAttachments === null;

    if (isReset) {
      // Apply default filters with current month date range
      onApplyFilters({
        weightRange: null,
        lengthRange: null,
        dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
        hasNotes: null,
        hasAttachments: null,
      });
    } else {
      // Add the slider values, but only include dateRange if it's explicitly set
      const formValues = {
        ...values,
        weightRange: values.weightRange || weightRange,
        lengthRange: values.lengthRange || lengthRange,
        // Only include dateRange if it's explicitly set in the form
        dateRange: values.dateRange || [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      };
      
      onApplyFilters(formValues);
    }
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      weightRange: null,
      lengthRange: null,
      dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      hasNotes: null,
      hasAttachments: null,
    });
    setWeightRange([0, 50000]);
    setLengthRange([0, 1200]);
    setDateRange({ from: defaultFromDate, to: defaultToDate });
    
    // Ensure filters are immediately applied after reset
    onApplyFilters({
      weightRange: null,
      lengthRange: null,
      dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      hasNotes: null,
      hasAttachments: null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[650px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Growth Records</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 2xl:space-y-6">
          <div className="space-y-4">
              {/* Date Range Filter */}
              <FormField
                control={form.control}
                name="dateRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">From</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange?.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                format(dateRange.from, "LLL dd, y")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={dateRange?.from}
                              onSelect={(date) => handleDateSelect(date, true)}
                              disabled={(date) => {
                                // Only disable future dates
                                return date > new Date();
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">To</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange?.to && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.to ? (
                                format(dateRange.to, "LLL dd, y")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={dateRange?.to}
                              onSelect={(date) => handleDateSelect(date, false)}
                              disabled={(date) => {
                                if (dateRange?.from) {
                                  const maxDate = addMonths(dateRange.from, 1);
                                  return date < dateRange.from || date > maxDate;
                                }
                                // Only disable future dates if no from date is selected
                                return date > new Date();
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3 lg:gap-5">
              {/* Weight Range Filter */}
              <FormField
                control={form.control}
                name="weightRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Weight Range (g)</FormLabel>
                    <div className="space-y-4">
                      <Slider
                        value={weightRange}
                        min={0}
                        max={50000}
                        step={100}
                        onValueChange={(value) => {
                          setWeightRange(value as [number, number]);
                          form.setValue("weightRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-xs">Min: {weightRange[0]}g</div>
                        <div className="text-xs">Max: {weightRange[1]}g</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Length Range Filter */}
              <FormField
                control={form.control}
                name="lengthRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Length Range (cm)</FormLabel>
                    <div className="space-y-4">
                      <Slider
                        value={lengthRange}
                        min={0}
                        max={1200}
                        step={100}
                        onValueChange={(value) => {
                          setLengthRange(value as [number, number]);
                          form.setValue("lengthRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-xs">Min: {lengthRange[0]}cm</div>
                        <div className="text-xs">Max: {lengthRange[1]}cm</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

 

            <div className="grid grid-cols-1 gap-4">
              {/* Has Notes Filter */}
              <FormField
                control={form.control}
                name="hasNotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => {
                          if (checked === 'indeterminate') return;
                          field.onChange(checked === true ? true : null);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Has Notes
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Has Attachments Filter */}
              <FormField
                control={form.control}
                name="hasAttachments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => {
                          if (checked === 'indeterminate') return;
                          field.onChange(checked === true ? true : null);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Has Attachments
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button type="submit">Apply Filters</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 