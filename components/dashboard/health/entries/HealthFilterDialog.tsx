'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SEVERITY_COLORS } from "@/lib/constants/colors";
import { HealthLogSeverity } from "@/lib/types/health";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getCurrentMonthDateRange } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const severities: HealthLogSeverity[] = ['low', 'moderate', 'high'];

export interface HealthFilters {
  category?: string[];
  subcategory?: string[];
  type?: string[];
  severity?: HealthLogSeverity[];
  resolved?: boolean | null;
  hasNotes?: boolean | null;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean | null;
}

const filterSchema = z.object({
  category: z.array(z.string()).optional(),
  subcategory: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  severity: z.array(z.string() as z.ZodType<HealthLogSeverity>).optional(),
  resolved: z.boolean().nullable().optional(),
  hasNotes: z.boolean().nullable().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  hasAttachments: z.boolean().nullable().optional(),
});

interface HealthFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: HealthFilters) => void;
  currentFilters: HealthFilters;
  categories: { id: string; label: string }[];
  subcategories: { id: string; category_id: string; label: string }[];
  types: { id: string; subcategory_id: string; label: string }[];
}

export function HealthFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
  categories,
  subcategories,
  types,
}: HealthFilterDialogProps) {
  const currentMonthRange = getCurrentMonthDateRange();
  const defaultFromDate = new Date(currentMonthRange.dateFrom);
  const defaultToDate = new Date(currentMonthRange.dateTo);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : defaultFromDate,
    to: currentFilters.dateTo ? new Date(currentFilters.dateTo) : defaultToDate,
  });

  const form = useForm<HealthFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      category: currentFilters.category || [],
      subcategory: currentFilters.subcategory || [],
      type: currentFilters.type || [],
      severity: currentFilters.severity || [],
      dateFrom: currentFilters.dateFrom || currentMonthRange.dateFrom,
      dateTo: currentFilters.dateTo || currentMonthRange.dateTo,
    },
  });

  const selectedCategoryIds = form.watch('category') || [];
  const selectedSubcategoryIds = form.watch('subcategory') || [];

  // Filter subcategories based on selected categories
  const filteredSubcategories = subcategories.filter(
    subcat => selectedCategoryIds.length === 0 || selectedCategoryIds.includes(subcat.category_id)
  );

  // Filter types based on selected subcategories
  const filteredTypes = types.filter(
    type => selectedSubcategoryIds.length === 0 || selectedSubcategoryIds.includes(type.subcategory_id)
  );

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

    // If selecting "to" date and it's more than 30 days from "from" date, adjust it
    if (!isFrom && newDateRange.from) {
      const maxDate = addMonths(newDateRange.from, 1);
      if (date > maxDate) {
        newDateRange.to = maxDate;
      }
    }

    setDateRange(newDateRange);
    form.setValue('dateFrom', newDateRange.from?.toISOString().split('T')[0] || '');
    form.setValue('dateTo', newDateRange.to?.toISOString().split('T')[0] || '');
  };

  function onSubmit(values: HealthFilters) {
    onApplyFilters(values);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      category: [],
      subcategory: [],
      type: [],
      severity: [],
      resolved: null,
      hasNotes: null,
      dateFrom: currentMonthRange.dateFrom,
      dateTo: currentMonthRange.dateTo,
      hasAttachments: null,
    });
    setDateRange({ from: defaultFromDate, to: defaultToDate });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[650px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Health Records</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 2xl:space-y-6">
                       {/* Date Range Filter */}
                       <FormField
              control={form.control}
              name="dateFrom"
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
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((categoryId) => {
                        const category = categories.find((c) => c.id === categoryId);
                        return category ? (
                          <Badge 
                            key={categoryId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {category.label}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== categoryId));
                              }}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              ✕
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </FormItem>
                )}
              />

              {/* Subcategory Filter */}
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                      disabled={filteredSubcategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((subcategoryId) => {
                        const subcategory = subcategories.find((s) => s.id === subcategoryId);
                        return subcategory ? (
                          <Badge 
                            key={subcategoryId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {subcategory.label}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== subcategoryId));
                              }}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              ✕
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                      disabled={filteredTypes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((typeId) => {
                        const type = types.find((t) => t.id === typeId);
                        return type ? (
                          <Badge 
                            key={typeId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {type.label}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== typeId));
                              }}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              ✕
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

              {/* Severity Filter */}
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {severities.map((severity) => (
                        <Badge
                          key={severity}
                          variant="custom"
                          className={`${SEVERITY_COLORS[severity]} cursor-pointer ${
                            field.value?.includes(severity) ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            const newValue = field.value?.includes(severity)
                              ? field.value.filter((s) => s !== severity)
                              : [...(field.value || []), severity];
                            field.onChange(newValue);
                          }}
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

            <Separator />

            <div className="grid grid-cols-1 gap-3">
              {/* Resolved Filter */}
              <FormField
                control={form.control}
                name="resolved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 ">
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
                        Resolved Issues Only
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Has Notes Filter */}
              <FormField
                control={form.control}
                name="hasNotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 ">
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
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 ">
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