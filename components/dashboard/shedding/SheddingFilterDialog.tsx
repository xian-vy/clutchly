import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { VirtualizedMorphSelect } from "../../ui/virtual-morph-select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCurrentMonthDateRange } from "@/lib/utils";
import { useState } from "react";

export interface SheddingFilters {
  completeness?: string[];
  dateRange?: [string, string] | null;
  species?: string[];
  morphs?: string[];
  hasNotes?: boolean | null;
}

const filterSchema = z.object({
  completeness: z.array(z.string()).optional(),
  dateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  species: z.array(z.string()).optional(),
  morphs: z.array(z.string()).optional(),
  hasNotes: z.boolean().nullable().optional(),
});

interface SheddingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: SheddingFilters) => void;
  currentFilters: SheddingFilters;
}

export function SheddingFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: SheddingFilterDialogProps) {
  const { species: availableSpecies } = useSpeciesStore();
  const currentMonthRange = getCurrentMonthDateRange();
  const defaultFromDate = new Date(currentMonthRange.dateFrom);
  const defaultToDate = new Date(currentMonthRange.dateTo);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: currentFilters.dateRange ? new Date(currentFilters.dateRange[0]) : defaultFromDate,
    to: currentFilters.dateRange ? new Date(currentFilters.dateRange[1]) : defaultToDate,
  });

  const form = useForm<SheddingFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      morphs: currentFilters.morphs || [],
      completeness: currentFilters.completeness || [],
      hasNotes: currentFilters.hasNotes || null,
      dateRange: currentFilters.dateRange || null,
    },
  });


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

    // Always update the state and form value
    setDateRange(newDateRange);
    form.setValue('dateRange', [
      newDateRange.from?.toISOString().split('T')[0] || '',
      newDateRange.to?.toISOString().split('T')[0] || ''
    ]);
  };

  const handleApply = () => {
    const values = form.getValues();
    // Only apply filters if at least one filter is set
    const hasFilters = Object.values(values).some(value => 
      value !== null && 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
    
    if (!hasFilters) {
      // If no filters are set, apply default date range only
      onApplyFilters({
        completeness: undefined,
        dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
        species: undefined,
        morphs: undefined,
        hasNotes: null,
      });
    } else {
      onApplyFilters(values);
    }
    onOpenChange(false);
  };

  const handleReset = () => {
    form.reset({
      completeness: undefined,
      dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      species: undefined,
      morphs: undefined,
      hasNotes: null,
    });
    setDateRange({ from: defaultFromDate, to: defaultToDate });
    onApplyFilters({
      completeness: undefined,
      dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
      species: undefined,
      morphs: undefined,
      hasNotes: null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Filter Shedding Records</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleApply)} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              {/* Species Filter */}
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSpecies.map((species) => (
                          <SelectItem key={species.id} value={species.id.toString()}>
                            {species.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((speciesId) => {
                        const species = availableSpecies.find((s) => s.id.toString() === speciesId);
                        return species ? (
                          <Badge 
                            key={speciesId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {species.name}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== speciesId));
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
                name="morphs"
                render={({ field }) => (
                  <VirtualizedMorphSelect field={field} />
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Completeness</Label>
                <Select
                  value={form.watch("completeness")?.[0] || ""}
                  onValueChange={(value) => form.setValue("completeness", value ? [value] : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select completeness" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="retained">Retained</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="hasNotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange(true);
                          } else if (field.value === true) {
                            field.onChange(null);
                          } else {
                            field.onChange(false);
                          }
                        }}
                        className={field.value === false ? "bg-destructive" : ""}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Has Notes: {field.value === true ? "Yes" : field.value === false ? "No" : "Any"}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

 

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 