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
import { SEX_COLORS, STATUS_COLORS } from "@/lib/constants/colors";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { VirtualizedMorphSelect } from "../../../ui/virtual-morph-select";
const sex = ['male', 'female', 'unknown'] as const;
const reptileStatus = ['active', 'sold', 'deceased'] as const;

export interface ReptileFilters {
  species?: string[];
  morphs?: string[];
  sex?: string[];
  status?: string[];
  isBreeder?: boolean | null;
  hasNotes?: boolean | null;
  weightRange?: [number, number] | null;
  acquisitionDateRange?: [string, string] | null;
  hatchDateRange?: [string, string] | null;
  visualTraits?: string[];
  hetTraits?: string[];
}

const filterSchema = z.object({
  species: z.array(z.string()).optional(),
  morphs: z.array(z.string()).optional(),
  sex: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  isBreeder: z.boolean().nullable().optional(),
  hasNotes: z.boolean().nullable().optional(),
  weightRange: z.tuple([z.number(), z.number()]).nullable().optional(),
  acquisitionDateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  hatchDateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  visualTraits: z.array(z.string()).optional(),
  hetTraits: z.array(z.string()).optional(),
});

interface ReptileFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: ReptileFilters) => void;
  currentFilters: ReptileFilters;
}

export function ReptileFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: ReptileFilterDialogProps) {


  const [weightRange, setWeightRange] = useState<[number, number]>(
    currentFilters.weightRange || [0, 1000]
  );

  const form = useForm<ReptileFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      morphs: currentFilters.morphs || [],
      sex: currentFilters.sex || [],
      status: currentFilters.status || [],
      visualTraits: currentFilters.visualTraits || [],
      hetTraits: currentFilters.hetTraits || [],
    },
  });

  const {species : availableSpecies} = useSpeciesStore();

  function onSubmit(values: ReptileFilters) {
    onApplyFilters(values);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      species: [],
      morphs: [],
      sex: [],
      status: [],
      isBreeder: null,
      hasNotes: null,
      weightRange: null,
      acquisitionDateRange: null,
      hatchDateRange: null,
      visualTraits: [],
      hetTraits: [],
    });
    setWeightRange([0, 1000]);
  }

  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Reptiles</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectTrigger>
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
                        <VirtualizedMorphSelect 
                         field={field} 
                        />
                    )}
                    />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sex Filter */}
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {sex.map((sex) => (
                        <Badge
                          key={sex}
                          variant="custom"
                          className={`${SEX_COLORS[sex]} cursor-pointer ${
                            field.value?.includes(sex) ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            const newValue = field.value?.includes(sex)
                              ? field.value.filter((s) => s !== sex)
                              : [...(field.value || []), sex];
                            field.onChange(newValue);
                          }}
                        >
                          {sex.charAt(0).toUpperCase() + sex.slice(1)}
                        </Badge>
                      ))}
                    </div>
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
                    <div className="flex flex-wrap gap-2">
                      {reptileStatus.map((status ) => (
                        <Badge
                          key={status}
                          variant="custom"
                          className={`${STATUS_COLORS[status]} cursor-pointer ${
                            field.value?.includes(status) ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            const newValue = field.value?.includes(status)
                              ? field.value.filter((s) => s !== status)
                              : [...(field.value || []), status];
                            field.onChange(newValue);
                          }}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Breeder Filter */}
              <FormField
                control={form.control}
                name="isBreeder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
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
                        Breeder Status: {field.value === true ? "Yes" : field.value === false ? "No" : "Any"}
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
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
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

            <Separator />

            {/* Weight Range Filter */}
            <FormField
              control={form.control}
              name="weightRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight Range (g): {weightRange[0]} - {weightRange[1]}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={weightRange}
                      onValueChange={(value) => {
                        setWeightRange(value as [number, number]);
                        field.onChange(value as [number, number]);
                      }}
                      className="mt-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Acquisition Date Range */}
              <FormField
                control={form.control}
                name="acquisitionDateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition Date Range</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={field.value?.[0] || ""}
                        onChange={(e) => {
                          const endDate = field.value?.[1] || "";
                          field.onChange([e.target.value, endDate]);
                        }}
                      />
                      <Input
                        type="date"
                        value={field.value?.[1] || ""}
                        onChange={(e) => {
                          const startDate = field.value?.[0] || "";
                          field.onChange([startDate, e.target.value]);
                        }}
                      />
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
                    <FormLabel>Hatch Date Range</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={field.value?.[0] || ""}
                        onChange={(e) => {
                          const endDate = field.value?.[1] || "";
                          field.onChange([e.target.value, endDate]);
                        }}
                      />
                      <Input
                        type="date"
                        value={field.value?.[1] || ""}
                        onChange={(e) => {
                          const startDate = field.value?.[0] || "";
                          field.onChange([startDate, e.target.value]);
                        }}
                      />
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