'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { CatalogEntry, NewCatalogEntry } from '@/lib/types/catalog';
import { Reptile } from '@/lib/types/reptile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { useGroupedReptileBySpeciesSelect } from '@/lib/hooks/useGroupedReptileBySpeciesSelect';

interface CatalogEntryFormProps {
  initialData?: CatalogEntry;
  availableReptiles: Reptile[];
  onSubmit: (data: NewCatalogEntry) => void;
  onCancel: () => void;
  featuredLimit: boolean;
}

// Create a schema that matches the NewCatalogEntry type but without org_id
// org_id will be added on the server
const formSchema = z.object({
  reptile_id: z.string({ required_error: 'Please select a reptile' }),
  featured: z.boolean(),
  display_order: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export function CatalogEntryForm({
  initialData,
  availableReptiles,
  onSubmit,
  onCancel,
  featuredLimit,
}: CatalogEntryFormProps) {

  const { ReptileSelect } = useGroupedReptileBySpeciesSelect({filteredReptiles: availableReptiles});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_id: initialData?.reptile_id || '',
      featured: initialData?.featured || false,
      display_order: initialData?.display_order || 0,
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        reptile_id: initialData.reptile_id,
        featured: initialData.featured,
        display_order: initialData.display_order,
      });
    }
  }, [form, initialData]);

  function handleSubmit(values: FormValues) {
    // The org_id will be added on the server side
    onSubmit({
      reptile_id: values.reptile_id,
      featured: values.featured,
      display_order: values.display_order,
      org_id: initialData?.org_id || '', // This will be overridden on the server
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reptile_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reptile</FormLabel>
                <FormControl>
                    <ReptileSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a reptile"
                      />
                </FormControl>
              {!initialData && availableReptiles.length === 0 && (
                <FormDescription className="text-destructive">
                  Please add a reptile first before adding a catalog entry.
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Featured</FormLabel>
                <FormDescription>
                  Featured reptiles appear prominently on your public catalog page and in social media previews.
                </FormDescription>
                {featuredLimit && (
                  <FormDescription className="text-destructive">
                    You can only feature up to 6 reptiles.
                  </FormDescription>
                )}
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={featuredLimit}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!initialData && availableReptiles.length === 0 || isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add to Catalog'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 