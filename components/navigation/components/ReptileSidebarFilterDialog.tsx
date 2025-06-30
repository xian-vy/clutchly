import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SEX_COLORS, STATUS_COLORS } from "@/lib/constants/colors";
import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { VirtualizedMorphSelect } from "../../ui/virtual-morph-select";

const sex = ["male", "female", "unknown"] as const;
const reptileStatus = ["active", "sold", "deceased"] as const;

export interface SidebarReptileFilters {
  species?: string[];
  morphs?: string[];
  sex?: string[];
  status?: string[];
  isBreeder?: boolean | null;
}

const filterSchema = z.object({
  species: z.array(z.string()).optional(),
  morphs: z.array(z.string()).optional(),
  sex: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  isBreeder: z.boolean().nullable().optional(),
});

interface ReptileSidebarFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: SidebarReptileFilters) => void;
  currentFilters: SidebarReptileFilters;
}

export function ReptileSidebarFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: ReptileSidebarFilterDialogProps) {
  const form = useForm<SidebarReptileFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      species: currentFilters.species || [],
      morphs: currentFilters.morphs || [],
      sex: currentFilters.sex || [],
      status: currentFilters.status || [],
    },
  });

  const { species: availableSpecies } = useSpeciesStore();

  function onSubmit(values: SidebarReptileFilters) {
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
    });
    onApplyFilters({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">Filter Reptiles</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Species Filter */}
              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...(field.value || []), value]);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full ">
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
                render={({ field }) => <VirtualizedMorphSelect field={field} />}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-2 ">
              {/* Sex Filter */}
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <div className="flex flex-wrap gap-1">
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
                    <div className="flex flex-wrap gap-1">
                      {reptileStatus.map((status) => (
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
              {/* Breeder Status Filter */}
              <FormField
                control={form.control}
                name="isBreeder"
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
                        Breeder Status: {field.value === true ? "Yes" : field.value === false ? "No" : "Any"}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex flex-row w-full justify-end gap-2 mt-4">
              <Button size="sm" type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
              <Button size="sm" type="submit">
                Apply
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 