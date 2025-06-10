'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { PaymentMethod } from '@/lib/types/sales';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { getCurrentMonthDateRange } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths } from 'date-fns';
import { toast } from 'sonner';

export interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  paymentMethod?: string;
  speciesId?: string;
  morphId?: string;
  priceRange?: [number, number];
  includesDocuments?: boolean;
}

const filterSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  paymentMethod: z.string().optional(),
  speciesId: z.string().optional(),
  morphId: z.string().optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  includesDocuments: z.boolean().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface SalesFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: SalesFilters) => void;
  currentFilters: SalesFilters;
}

export function SalesFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: SalesFilterDialogProps) {
  const { species } = useSpeciesStore();
  const { morphs } = useMorphsStore();
  
  // Dropdown states
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [morphOpen, setMorphOpen] = useState(false);

  const currentMonthRange = getCurrentMonthDateRange();
  const defaultFromDate = new Date(currentMonthRange.dateFrom);
  const defaultToDate = new Date(currentMonthRange.dateTo);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : defaultFromDate,
    to: currentFilters.dateTo ? new Date(currentFilters.dateTo) : defaultToDate,
  });

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: currentFilters.status || 'all',
      dateFrom: currentFilters.dateFrom || currentMonthRange.dateFrom,
      dateTo: currentFilters.dateTo || currentMonthRange.dateTo,
      paymentMethod: currentFilters.paymentMethod || 'all',
      speciesId: currentFilters.speciesId,
      morphId: currentFilters.morphId,
      priceRange: currentFilters.priceRange || [0, 10000],
      includesDocuments: currentFilters.includesDocuments,
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

  function onSubmit(values: FilterFormValues) {
    const filters = {
      status: values.status === "all" ? undefined : values.status,
      dateFrom: values.dateFrom || undefined,
      dateTo: values.dateTo || undefined,
      paymentMethod: values.paymentMethod === "all" ? undefined : values.paymentMethod,
      speciesId: values.speciesId,
      morphId: values.morphId,
      priceRange: values.priceRange,
      includesDocuments: values.includesDocuments,
    };
    
    onApplyFilters(filters);
    onOpenChange(false);
  }

  function handleReset() {
    form.reset({
      status: "all",
      dateFrom: currentMonthRange.dateFrom,
      dateTo: currentMonthRange.dateTo,
      paymentMethod: "all",
      speciesId: undefined,
      morphId: undefined,
      priceRange: undefined,
      includesDocuments: undefined,
    });
    setDateRange({ from: defaultFromDate, to: defaultToDate });
    
    // Immediately apply the reset filters
    onApplyFilters({
      status: undefined,
      dateFrom: currentMonthRange.dateFrom,
      dateTo: currentMonthRange.dateTo,
      paymentMethod: undefined,
      speciesId: undefined,
      morphId: undefined,
      priceRange: undefined,
      includesDocuments: undefined,
    });
  }

  // Filter morphs based on selected species
  const filteredMorphs = form.watch('speciesId')
    ? morphs.filter(morph => morph.species_id.toString() === form.watch('speciesId'))
    : morphs;

  // Payment method options
  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "other", label: "Other" },
  ];

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Sales Records</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
            </div>
            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value ?? "all"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      value={field.value ?? "all"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {paymentOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="speciesId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <Popover open={speciesOpen} onOpenChange={setSpeciesOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={speciesOpen}
                            className="justify-between w-full"
                          >
                            {field.value
                              ? species.find((s) => s.id.toString() === field.value)?.name
                              : "Select species"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-[200px] overflow-y-auto">
                        <Command>
                          <CommandInput placeholder="Search species..." />
                          <CommandEmpty>No species found</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="clear"
                              onSelect={() => {
                                field.onChange(undefined);
                                form.setValue('morphId', undefined);
                                setSpeciesOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Clear selection
                            </CommandItem>
                            {species.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={s.name}
                                onSelect={() => {
                                  field.onChange(s.id.toString());
                                  form.setValue('morphId', undefined);
                                  setSpeciesOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === s.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {s.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="morphId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morph</FormLabel>
                    <Popover open={morphOpen} onOpenChange={setMorphOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={morphOpen}
                            disabled={!form.watch('speciesId')}
                            className="justify-between w-full"
                          >
                            {field.value
                              ? morphs.find((m) => m.id.toString() === field.value)?.name
                              : "Select morph"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-[200px] overflow-y-auto">
                        <Command>
                          <CommandInput placeholder="Search morphs..." />
                          <CommandEmpty>No morphs found</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="clear"
                              onSelect={() => {
                                field.onChange(undefined);
                                setMorphOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Clear selection
                            </CommandItem>
                            {filteredMorphs.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={m.name}
                                onSelect={() => {
                                  field.onChange(m.id.toString());
                                  setMorphOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === m.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {m.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="priceRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Range</FormLabel>
                  <div className="pt-2">
                    <Slider
                      min={0}
                      max={10000}
                      step={50}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${field.value?.[0] ?? 0}</span>
                      <span>${field.value?.[1] ?? 10000}</span>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Separator />



            <FormField
              control={form.control}
              name="includesDocuments"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Includes documentation</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">Apply Filters</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}