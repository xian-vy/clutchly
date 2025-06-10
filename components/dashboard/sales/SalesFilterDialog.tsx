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
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { getCurrentMonthDateRange } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

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

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: currentFilters.status || 'all',
      dateFrom: currentFilters.dateFrom || getCurrentMonthDateRange().dateFrom,
      dateTo: currentFilters.dateTo || getCurrentMonthDateRange().dateTo,
      paymentMethod: currentFilters.paymentMethod || 'all',
      speciesId: currentFilters.speciesId,
      morphId: currentFilters.morphId,
      priceRange: currentFilters.priceRange || [0, 10000],
      includesDocuments: currentFilters.includesDocuments,
    },
  });

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
      dateFrom: undefined,
      dateTo: undefined,
      paymentMethod: "all",
      speciesId: undefined,
      morphId: undefined,
      priceRange: undefined,
      includesDocuments: undefined,
    });
    
    // Immediately apply the reset filters
    onApplyFilters({
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
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
      <DialogContent className="sm:max-w-[500px] xl:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Filter Sales Records</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date From</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date To</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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