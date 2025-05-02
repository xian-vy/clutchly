'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ExpenseCategory, ExpenseStatus } from '@/lib/types/expenses';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Separator } from '@/components/ui/separator';

export interface ExpenseFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: ExpenseFilters) => void;
  currentFilters: ExpenseFilters;
}

export interface ExpenseFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  category?: string;
  vendor?: string;
}

const filterSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountRange: z.tuple([z.number(), z.number()]).optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export function ExpenseFilterDialog({ 
  open, 
  onOpenChange, 
  onApplyFilters, 
  currentFilters 
}: ExpenseFilterDialogProps) {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: currentFilters.status,
      dateFrom: currentFilters.dateFrom,
      dateTo: currentFilters.dateTo,
      amountRange: currentFilters.amountFrom && currentFilters.amountTo 
        ? [currentFilters.amountFrom, currentFilters.amountTo]
        : [0, 20000],
      category: currentFilters.category,
      vendor: currentFilters.vendor,
    },
  });

  function onSubmit(values: FilterFormValues) {
    const filters = {
      status: values.status === "all" ? undefined : values.status,
      dateFrom: values.dateFrom || undefined,
      dateTo: values.dateTo || undefined,
      amountFrom: values.amountRange?.[0],
      amountTo: values.amountRange?.[1],
      category: values.category === "all" ? undefined : values.category,
      vendor: values.vendor || undefined,
    };
    
    onApplyFilters(filters);
    onOpenChange(false);
  }

  function handleReset() {
    form.reset({
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
      amountRange: undefined,
      category: "all",
      vendor: undefined,
    });
    
    // Immediately apply the reset filters
    onApplyFilters({
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      amountFrom: undefined,
      amountTo: undefined,
      category: undefined,
      vendor: undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Expenses</DialogTitle>
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
                        {Object.values(ExpenseStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ?? "all"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(ExpenseCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amountRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Range</FormLabel>
                    <div className="pt-2">
                      <Slider
                        min={0}
                        max={20000}
                        step={10}
                        value={field.value}
                        onValueChange={field.onChange}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>${field.value?.[0] ?? 0}</span>
                        <span>${field.value?.[1] ?? 20000}</span>
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
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Filter by vendor name"
                      {...field}
                    />
                  </FormControl>
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