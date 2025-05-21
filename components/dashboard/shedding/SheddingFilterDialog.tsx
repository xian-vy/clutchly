import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { VirtualizedMorphSelect } from "../../ui/virtual-morph-select";
import { Separator } from "@/components/ui/separator";

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

  const form = useForm<SheddingFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      morphs: currentFilters.morphs || [],
      completeness: currentFilters.completeness || [],
      hasNotes: currentFilters.hasNotes || null,
    },
  });

  const handleApply = () => {
    const values = form.getValues();
    // Only apply filters if at least one filter is set
    const hasFilters = Object.values(values).some(value => 
      value !== null && 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
    onApplyFilters(hasFilters ? values : {});
    onOpenChange(false);
  };

  const handleReset = () => {
    form.reset({
      completeness: undefined,
      dateRange: null,
      species: undefined,
      morphs: undefined,
      hasNotes: null,
    });
    onApplyFilters({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Filter Shedding Records</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleApply)} className="space-y-4">
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

            <div className="grid gap-2">
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={form.watch("dateRange")?.[0] || ""}
                  onChange={(e) => {
                    const endDate = form.watch("dateRange")?.[1] || "";
                    form.setValue("dateRange", [e.target.value, endDate]);
                  }}
                />
                <Input
                  type="date"
                  value={form.watch("dateRange")?.[1] || ""}
                  onChange={(e) => {
                    const startDate = form.watch("dateRange")?.[0] || "";
                    form.setValue("dateRange", [startDate, e.target.value]);
                  }}
                />
              </div>
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