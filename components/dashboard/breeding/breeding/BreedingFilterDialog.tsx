'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { BreedingStatus, IncubationStatus } from "@/lib/types/breeding";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const breedingStatuses: BreedingStatus[] = ['active', 'completed', 'failed', 'planned'];
const incubationStatuses: IncubationStatus[] = ['not_started', 'in_progress', 'completed', 'failed'];

export interface BreedingFilters {
  species?: string[];
  breedingStatus?: BreedingStatus[];
  incubationStatus?: IncubationStatus[];
  eggCountRange?: [number, number] | null;
  fertileCountRange?: [number, number] | null;
  incubationTempRange?: [number, number] | null;
  incubationHumidityRange?: [number, number] | null;
  startDateRange?: [string, string] | null;
  layDateRange?: [string, string] | null;
  hatchDateRange?: [string, string] | null;
  hasNotes?: boolean | null;
}

const filterSchema = z.object({
  species: z.array(z.string()).optional(),
  breedingStatus: z.array(z.string() as z.ZodType<BreedingStatus>).optional(),
  incubationStatus: z.array(z.string() as z.ZodType<IncubationStatus>).optional(),
  eggCountRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  fertileCountRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  incubationTempRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  incubationHumidityRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  startDateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  layDateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  hatchDateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  hasNotes: z.boolean().nullable().optional(),
});

interface BreedingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: BreedingFilters) => void;
  currentFilters: BreedingFilters;
}

export function BreedingFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: BreedingFilterDialogProps) {
  const [eggCountRange, setEggCountRange] = useState<[number, number]>(
    currentFilters.eggCountRange || [0, 50]
  );
  
  const [fertileCountRange, setFertileCountRange] = useState<[number, number]>(
    currentFilters.fertileCountRange || [0, 50]
  );
  
  const [incubationTempRange, setIncubationTempRange] = useState<[number, number]>(
    currentFilters.incubationTempRange || [20, 40]
  );
  
  const [incubationHumidityRange, setIncubationHumidityRange] = useState<[number, number]>(
    currentFilters.incubationHumidityRange || [0, 100]
  );

  const form = useForm<BreedingFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      breedingStatus: currentFilters.breedingStatus || [],
      incubationStatus: currentFilters.incubationStatus || [],
    },
  });

  const { species: availableSpecies } = useSpeciesStore();

  function onSubmit(values: BreedingFilters) {
    // Add the slider values
    const formValues = {
      ...values,
      eggCountRange: values.eggCountRange || eggCountRange,
      fertileCountRange: values.fertileCountRange || fertileCountRange,
      incubationTempRange: values.incubationTempRange || incubationTempRange,
      incubationHumidityRange: values.incubationHumidityRange || incubationHumidityRange,
    };
    
    onApplyFilters(formValues);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      species: [],
      breedingStatus: [],
      incubationStatus: [],
      eggCountRange: null,
      fertileCountRange: null,
      incubationTempRange: null,
      incubationHumidityRange: null,
      startDateRange: null,
      layDateRange: null,
      hatchDateRange: null,
      hasNotes: null,
    });
    setEggCountRange([0, 50]);
    setFertileCountRange([0, 50]);
    setIncubationTempRange([20, 40]);
    setIncubationHumidityRange([0, 100]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[650px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Breeding Projects</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 2xl:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Breeding Status Filter */}
              <FormField
                control={form.control}
                name="breedingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breeding Status</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {breedingStatuses.map((status) => (
                        <Badge
                          key={status}
                          variant="outline"
                          className={`capitalize cursor-pointer ${
                            field.value?.includes(status) ? "bg-primary/20 ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            const newValue = field.value?.includes(status)
                              ? field.value.filter((s) => s !== status)
                              : [...(field.value || []), status];
                            field.onChange(newValue);
                          }}
                        >
                          {status.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              {/* Incubation Status Filter */}
              <FormField
                control={form.control}
                name="incubationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incubation Status</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {incubationStatuses.map((status) => (
                        <Badge
                          key={status}
                          variant="outline"
                          className={`capitalize cursor-pointer ${
                            field.value?.includes(status) ? "bg-primary/20 ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            const newValue = field.value?.includes(status)
                              ? field.value.filter((s) => s !== status)
                              : [...(field.value || []), status];
                            field.onChange(newValue);
                          }}
                        >
                          {status.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              {/* Egg Count Range Filter */}
              <FormField
                control={form.control}
                name="eggCountRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Egg Count Range</FormLabel>
                    <div className="space-y-4">
                      <Slider
                        value={eggCountRange}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={(value) => {
                          setEggCountRange(value as [number, number]);
                          form.setValue("eggCountRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Min: {eggCountRange[0]}</div>
                        <div className="text-sm">Max: {eggCountRange[1]}</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Fertile Count Range Filter */}
              <FormField
                control={form.control}
                name="fertileCountRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Fertile Egg Count Range</FormLabel>
                    <div className="space-y-4">
                      <Slider
                        value={fertileCountRange}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={(value) => {
                          setFertileCountRange(value as [number, number]);
                          form.setValue("fertileCountRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Min: {fertileCountRange[0]}</div>
                        <div className="text-sm">Max: {fertileCountRange[1]}</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Incubation Temperature Range Filter */}
              <FormField
                control={form.control}
                name="incubationTempRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Incubation Temperature Range (°C)</FormLabel>
                    <div className="space-y-4">
                      <Slider
                        value={incubationTempRange}
                        min={20}
                        max={40}
                        step={0.1}
                        onValueChange={(value) => {
                          setIncubationTempRange(value as [number, number]);
                          form.setValue("incubationTempRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Min: {incubationTempRange[0]}°C</div>
                        <div className="text-sm">Max: {incubationTempRange[1]}°C</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Incubation Humidity Range Filter */}
              <FormField
                control={form.control}
                name="incubationHumidityRange"
                render={() => (
                  <FormItem>
                    <FormLabel>Incubation Humidity Range (%)</FormLabel>
                    <div className="space-y-4">
                      <Slider
                        value={incubationHumidityRange}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => {
                          setIncubationHumidityRange(value as [number, number]);
                          form.setValue("incubationHumidityRange", value as [number, number]);
                        }}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Min: {incubationHumidityRange[0]}%</div>
                        <div className="text-sm">Max: {incubationHumidityRange[1]}%</div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              {/* Date Ranges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Date Range */}
                <FormField
                  control={form.control}
                  name="startDateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Start Date</FormLabel>
                      <div className="flex flex-col space-y-2">
                        <div>
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
                        <div>
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

                {/* Lay Date Range */}
                <FormField
                  control={form.control}
                  name="layDateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clutch Lay Date</FormLabel>
                      <div className="flex flex-col space-y-2">
                        <div>
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
                        <div>
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

                {/* Hatch Date Range */}
                <FormField
                  control={form.control}
                  name="hatchDateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hatch Date</FormLabel>
                      <div className="flex flex-col space-y-2">
                        <div>
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
                        <div>
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