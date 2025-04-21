'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
    currentFilters.weightRange || [0, 1000]
  );
  
  const [lengthRange, setLengthRange] = useState<[number, number]>(
    currentFilters.lengthRange || [0, 200]
  );

  const form = useForm<GrowthFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      weightRange: currentFilters.weightRange || null,
      lengthRange: currentFilters.lengthRange || null,
    },
  });

  function onSubmit(values: GrowthFilters) {
    // Add the slider values
    const formValues = {
      ...values,
      weightRange: values.weightRange || weightRange,
      lengthRange: values.lengthRange || lengthRange,
    };
    
    onApplyFilters(formValues);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      weightRange: null,
      lengthRange: null,
      dateRange: null,
      hasNotes: null,
      hasAttachments: null,
    });
    setWeightRange([0, 1000]);
    setLengthRange([0, 200]);
    
    // Ensure filters are immediately applied after reset
    onApplyFilters({
      weightRange: null,
      lengthRange: null,
      dateRange: null,
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
                        max={1000}
                        step={1}
                        onValueChange={(value) => {
                          setWeightRange(value as [number, number]);
                          form.setValue("weightRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Min: {weightRange[0]}g</div>
                        <div className="text-sm">Max: {weightRange[1]}g</div>
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
                        max={200}
                        step={1}
                        onValueChange={(value) => {
                          setLengthRange(value as [number, number]);
                          form.setValue("lengthRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Min: {lengthRange[0]}cm</div>
                        <div className="text-sm">Max: {lengthRange[1]}cm</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              {/* Date Range Filter */}
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <FormLabel className="text-xs">From</FormLabel>
                        <Input
                          type="date"
                          value={field.value?.[0] || ""}
                          onChange={(e) => {
                            const startDate = e.target.value;
                            const endDate = field.value?.[1] || "";
                            field.onChange([startDate, endDate]);
                          }}
                        />
                      </div>
                      <div className="w-1/2">
                        <FormLabel className="text-xs">To</FormLabel>
                        <Input
                          type="date"
                          value={field.value?.[1] || ""}
                          onChange={(e) => {
                            const startDate = field.value?.[0] || "";
                            const endDate = e.target.value;
                            field.onChange([startDate, endDate]);
                          }}
                        />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Has Notes Filter */}
              <FormField
                control={form.control}
                name="hasNotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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