'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SEVERITY_COLORS } from "@/lib/constants/colors";
import { HealthLogSeverity } from "@/lib/types/health";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const severities: HealthLogSeverity[] = ['low', 'moderate', 'high'];

export interface HealthFilters {
  category?: string[];
  subcategory?: string[];
  type?: string[];
  severity?: HealthLogSeverity[];
  resolved?: boolean | null;
  hasNotes?: boolean | null;
  dateRange?: [string, string] | null;
  hasAttachments?: boolean | null;
}

const filterSchema = z.object({
  category: z.array(z.string()).optional(),
  subcategory: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  severity: z.array(z.string() as z.ZodType<HealthLogSeverity>).optional(),
  resolved: z.boolean().nullable().optional(),
  hasNotes: z.boolean().nullable().optional(),
  dateRange: z.tuple([z.string(), z.string()]).nullable().optional(),
  hasAttachments: z.boolean().nullable().optional(),
});

interface HealthFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: HealthFilters) => void;
  currentFilters: HealthFilters;
  categories: { id: string; label: string }[];
  subcategories: { id: string; category_id: string; label: string }[];
  types: { id: string; subcategory_id: string; label: string }[];
}

export function HealthFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
  categories,
  subcategories,
  types,
}: HealthFilterDialogProps) {
  const form = useForm<HealthFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ...currentFilters,
      category: currentFilters.category || [],
      subcategory: currentFilters.subcategory || [],
      type: currentFilters.type || [],
      severity: currentFilters.severity || [],
    },
  });

  const selectedCategoryIds = form.watch('category') || [];
  const selectedSubcategoryIds = form.watch('subcategory') || [];

  // Filter subcategories based on selected categories
  const filteredSubcategories = subcategories.filter(
    subcat => selectedCategoryIds.length === 0 || selectedCategoryIds.includes(subcat.category_id)
  );

  // Filter types based on selected subcategories
  const filteredTypes = types.filter(
    type => selectedSubcategoryIds.length === 0 || selectedSubcategoryIds.includes(type.subcategory_id)
  );

  function onSubmit(values: HealthFilters) {
    onApplyFilters(values);
    onOpenChange(false);
  }

  function resetFilters() {
    form.reset({
      category: [],
      subcategory: [],
      type: [],
      severity: [],
      resolved: null,
      hasNotes: null,
      dateRange: null,
      hasAttachments: null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] 2xl:max-w-[650px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Health Records</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 2xl:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((categoryId) => {
                        const category = categories.find((c) => c.id === categoryId);
                        return category ? (
                          <Badge 
                            key={categoryId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {category.label}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== categoryId));
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

              {/* Subcategory Filter */}
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                      disabled={filteredSubcategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((subcategoryId) => {
                        const subcategory = subcategories.find((s) => s.id === subcategoryId);
                        return subcategory ? (
                          <Badge 
                            key={subcategoryId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {subcategory.label}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== subcategoryId));
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value || [], value]);
                      }}
                      disabled={filteredTypes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value?.map((typeId) => {
                        const type = types.find((t) => t.id === typeId);
                        return type ? (
                          <Badge 
                            key={typeId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {type.label}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((id) => id !== typeId));
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

              {/* Severity Filter */}
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {severities.map((severity) => (
                        <Badge
                          key={severity}
                          variant="custom"
                          className={`${SEVERITY_COLORS[severity]} cursor-pointer ${
                            field.value?.includes(severity) ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            const newValue = field.value?.includes(severity)
                              ? field.value.filter((s) => s !== severity)
                              : [...(field.value || []), severity];
                            field.onChange(newValue);
                          }}
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

            <Separator />

            <div className="grid grid-cols-1 gap-3">
              {/* Resolved Filter */}
              <FormField
                control={form.control}
                name="resolved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 ">
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
                        Resolved Issues Only
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
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 ">
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
                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 ">
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