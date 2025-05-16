'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { SEX_COLORS } from "@/lib/constants/colors";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { VirtualizedMorphSelect } from "@/components/ui/virtual-morph-select";
import { CircleHelp, Mars, Venus } from "lucide-react";

const sex = ['male', 'female', 'unknown'] as const;
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
] as const;

export interface CatalogFilters {
  species?: string[];
  morphs?: string[];
  sex?: string[];
  featured?: boolean | null;
  ageInMonths?: [number, number] | null;
  sortBy?: string;
}

const filterSchema = z.object({
  species: z.array(z.string()).optional(),
  morphs: z.array(z.string()).optional(),
  sex: z.array(z.string()).optional(),
  featured: z.boolean().nullable().optional(),
  ageInMonths: z.tuple([z.number(), z.number()]).nullable().optional(),
  sortBy: z.string().optional(),
});

interface CatalogFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: CatalogFilters) => void;
  currentFilters: CatalogFilters;
}

export function CatalogFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: CatalogFilterDialogProps) {
  const [ageRange, setAgeRange] = useState<[number, number]>(
    currentFilters.ageInMonths || [0, 80]
  );

  const form = useForm<CatalogFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      morphs: currentFilters.morphs || [],
      sex: currentFilters.sex || [],
      featured: currentFilters.featured || null,
      ageInMonths: currentFilters.ageInMonths || [0, 80],
      sortBy: currentFilters.sortBy || 'newest',
    },
  });

  const { species: availableSpecies } = useSpeciesStore();

  function onSubmit(values: CatalogFilters) {
    onApplyFilters(values);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      species: [],
      morphs: [],
      sex: [],
      featured: null,
      ageInMonths: [0, 80],
      sortBy: 'newest',
    });
    setAgeRange([0, 80]);
  }

  const formatAgeLabel = (months: number) => {
    if (months === 0) return "< 1 month";
    if (months === 1) return "1 month";
    return `${months} months`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[550px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">Filters</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 sm:space-y-4">
            {/* Sort options */}
            <FormField
              control={form.control}
              name="sortBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort by</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sort option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4">
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

              {/* Morphs Filter */}
              <FormField
                control={form.control}
                name="morphs"
                render={({ field }) => (
                  <VirtualizedMorphSelect field={field} />
                )}
              />
            </div>

            <Separator />

            {/* Sex Filter */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {sex.map((sexOption) => (
                      <Badge
                        key={sexOption}
                        variant="custom"
                        className={`${SEX_COLORS[sexOption]} cursor-pointer ${
                          field.value?.includes(sexOption) ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => {
                          const newValue = field.value?.includes(sexOption)
                            ? field.value.filter((s) => s !== sexOption)
                            : [...(field.value || []), sexOption];
                          field.onChange(newValue);
                        }}
                      >
                        {sexOption === 'male' ? (
                          <span className="flex items-center">
                            <Mars className="h-3.5 w-3.5 mr-1" />
                            Male
                          </span>
                        ) : sexOption === 'female' ? (
                          <span className="flex items-center">
                            <Venus className="h-3.5 w-3.5 mr-1" />
                            Female
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <CircleHelp className="h-3.5 w-3.5 mr-1" />
                            Unknown
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            {/* Featured Only Filter */}
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Status</FormLabel>
                  <div className="flex gap-2">
                    <Badge
                      variant={field.value === true ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => field.onChange(field.value === true ? null : true)}
                    >
                      Featured Only
                    </Badge>
                    <Badge
                      variant={field.value === false ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => field.onChange(field.value === false ? null : false)}
                    >
                      Not Featured
                    </Badge>
                    <Badge
                      variant={field.value === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => field.onChange(null)}
                    >
                      All
                    </Badge>
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            {/* Age Range Filter */}
            <FormField
              control={form.control}
              name="ageInMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Age Range: {formatAgeLabel(ageRange[0])} - {formatAgeLabel(ageRange[1])}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={80}
                      step={1}
                      value={ageRange}
                      onValueChange={(value) => {
                        setAgeRange(value as [number, number]);
                        field.onChange(value as [number, number]);
                      }}
                      className="mt-2"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-row w-full justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetFilters}>
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