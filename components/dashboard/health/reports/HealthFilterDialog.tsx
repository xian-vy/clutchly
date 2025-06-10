'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroupedReptileBySpeciesSelect } from "@/lib/hooks/useGroupedReptileBySpeciesSelect";
import { HealthCategory } from "@/lib/types/health";
import { Reptile } from "@/lib/types/reptile";
import { getCurrentMonthDateRange } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export interface HealthFilters {
  reptileId?: string | null;
  categoryId?: string | null;
  severity?: string | null;
  status?: string | null;
  dateRange?: [string, string] | null;
}

const filterSchema = z.object({
  reptileId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  severity: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  dateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
});

interface HealthFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: HealthFilters) => void;
  currentFilters: HealthFilters;
  categories: HealthCategory[];
  reptiles: Reptile[];
}

export function HealthFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
  categories,
  reptiles,
}: HealthFilterDialogProps) {
  const currentMonthRange = getCurrentMonthDateRange();
  const defaultFromDate = new Date(currentMonthRange.dateFrom);
  const defaultToDate = new Date(currentMonthRange.dateTo);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: currentFilters.dateRange ? new Date(currentFilters.dateRange[0]) : defaultFromDate,
    to: currentFilters.dateRange ? new Date(currentFilters.dateRange[1]) : defaultToDate,
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

  const { ReptileSelect } = useGroupedReptileBySpeciesSelect({filteredReptiles: reptiles});

  const form = useForm<HealthFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      dateRange: currentFilters.dateRange || [currentMonthRange.dateFrom, currentMonthRange.dateTo],
    },
  });

  function onSubmit(values: HealthFilters) {
    // If all values are null/undefined/empty, treat it as a reset
    const isReset = !values.reptileId && 
                   !values.categoryId && 
                   !values.severity && 
                   !values.status && 
                   !values.dateRange;

    if (isReset) {
      // Apply default filters with current month date range
      onApplyFilters({
        reptileId: null,
        categoryId: null,
        severity: null,
        status: null,
        dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      });
    } else {
      // Add the date range values
      const formValues = {
        ...values,
        dateRange: values.dateRange || [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      };
      
      onApplyFilters(formValues);
    }
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      reptileId: null,
      categoryId: null,
      severity: null,
      status: null,
      dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
    });
    setDateRange({ from: defaultFromDate, to: defaultToDate });
    
    // Ensure filters are immediately applied after reset
    onApplyFilters({
      reptileId: null,
      categoryId: null,
      severity: null,
      status: null,
      dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-[550px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Health Records</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 2xl:space-y-6">
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
            <div className="grid grid-cols-2 gap-4">
              {/* Reptile Filter */}
              <FormField
                control={form.control}
                name="reptileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reptile</FormLabel>
                    <FormControl>
                      <ReptileSelect
                        value={field.value || undefined}
                        onValueChange={(value) => field.onChange(value === 'all' ? null : value)}
                        placeholder="Select a reptile"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Category Filter */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value === 'all' ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Severity Filter */}
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value === 'all' ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Severities" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Status Filter */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value === 'all' ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
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