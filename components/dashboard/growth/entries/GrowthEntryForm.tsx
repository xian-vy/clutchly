'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GrowthEntry, CreateGrowthEntryInput } from '@/lib/types/growth';
import { useResource } from '@/lib/hooks/useResource';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Loader2 } from 'lucide-react';

// Define the form schema to match the CreateGrowthEntryInput type
const formSchema = z.object({
  reptile_id: z.string().min(1, 'Reptile is required'),
  user_id: z.string().optional(),
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
  // Use the useResource hook to fetch reptiles
  const { 
    resources: reptiles, 
    isLoading: isReptilesLoading 
  } = useResource<Reptile, any>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_id: initialData?.reptile_id || '',
      user_id: initialData?.user_id || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      weight: initialData?.weight || 0,
      length: initialData?.length || 0,
      notes: initialData?.notes || '',
      attachments: initialData?.attachments || [],
    }
  });

  // Handle form submission
  const handleSubmit = async (data: FormValues) => {
    const { user_id, ...formData } = data;
    await onSubmit(formData as CreateGrowthEntryInput);
  };

  if (isReptilesLoading) {
    return <div>Loading...</div>;
  }

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
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isReptilesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reptile" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isReptilesLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      reptiles.map((reptile) => (
                        <SelectItem key={reptile.id} value={reptile.id}>
                          {reptile.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Growth Entry
          </Button>
        </div>
      </form>
    </Form>
  );
} 