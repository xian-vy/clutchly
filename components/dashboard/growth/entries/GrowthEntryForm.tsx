'use client';

import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGroupedReptileBySpeciesSelect } from '@/lib/hooks/useGroupedReptileBySpeciesSelect';
import { CreateGrowthEntryInput, GrowthEntry } from '@/lib/types/growth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the form schema to match the CreateGrowthEntryInput type
const formSchema = z.object({
  reptile_id: z.string().min(1, 'Reptile is required'),
  org_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  weight: z.coerce.number().min(0, 'Weight must be a positive number'),
  length: z.coerce.number().min(0, 'Length must be a positive number'),
  notes: z.string().optional(),
  attachments: z.array(z.string()),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface GrowthEntryFormProps {
  initialData?: GrowthEntry;
  onSubmit: (data: CreateGrowthEntryInput) => Promise<void>;
  onCancel: () => void;
}

export function GrowthEntryForm({ initialData, onSubmit, onCancel }: GrowthEntryFormProps) {

  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })
 
  const { ReptileSelect } = useGroupedReptileBySpeciesSelect({filteredReptiles: reptiles});
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_id: initialData?.reptile_id || '',
      org_id: initialData?.org_id || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      weight: initialData?.weight || 0,
      length: initialData?.length || 0,
      notes: initialData?.notes || '',
      attachments: initialData?.attachments || [],
    }
  });
  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: FormValues) => {
    const { ...formData } = data;
    await onSubmit(formData as CreateGrowthEntryInput);
    queryClient.invalidateQueries({ queryKey: ['reptiles'] });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes about this growth entry..." 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'} Growth Entry
          </Button>
        </div>
      </form>
    </Form>
  );
} 