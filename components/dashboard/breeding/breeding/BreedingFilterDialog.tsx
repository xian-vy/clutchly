'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BreedingStatus } from "@/lib/types/breeding";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { STATUS_COLORS } from "@/lib/constants/colors";

const breedingStatuses: BreedingStatus[] = ['active', 'completed', 'failed', 'planned'];

export interface BreedingFilters {
  species?: string[];
  breedingStatus?: BreedingStatus[];
  startDateRange?: [string, string] | null;
  hatchDateRange?: [string, string] | null;
  hasNotes?: boolean | null;
}

const filterSchema = z.object({
  species: z.array(z.string()).optional(),
  breedingStatus: z.array(z.string() as z.ZodType<BreedingStatus>).optional(),
  startDateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
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

  const form = useForm<BreedingFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      breedingStatus: currentFilters.breedingStatus || [],
    },
  });

  const { species: availableSpecies } = useSpeciesStore();

  function onSubmit(values: BreedingFilters) {
    onApplyFilters(values);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      species: [],
      breedingStatus: [],
      startDateRange: null,
      hatchDateRange: null,
      hasNotes: null,
    });
    
    // Ensure filters are immediately applied after reset
    onApplyFilters({
      species: [],
      breedingStatus: [],
      startDateRange: null,
      hatchDateRange: null,
      hasNotes: null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[650px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Breeding Projects</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-5 2xl:space-y-6">
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
                          variant="custom"
                          className={`capitalize ${STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS]} cursor-pointer ${
                            field.value?.includes(status) ? "ring-2 ring-primary" : ""
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
                {/* Start Date Range */}
                <FormField
                  control={form.control}
                  name="startDateRange"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-4 space-y-2">
                        <div className="space-y-2">
                          <FormLabel className="text-xs">Date Start</FormLabel>
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
                        <div className="space-y-2">
                          <FormLabel className="text-xs">Date End</FormLabel>
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 ">
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