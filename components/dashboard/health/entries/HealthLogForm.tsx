'use client';

import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useHealthStore } from '@/lib/stores/healthStore';
import { CreateHealthLogEntryInput, HealthLogEntry } from '@/lib/types/health';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { HealthCategorySelect } from './HealthCategorySelect';

// Define the form schema to match the CreateHealthLogEntryInput type
const formSchema = z.object({
  reptile_id: z.string().min(1, 'Reptile is required'),
  org_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  category_id: z.string().min(1, 'Category is required'),
  subcategory_id: z.string().min(1, 'Subcategory is required'),
  type_id: z.string().nullable(),
  custom_type_label: z.string().optional(),
  notes: z.string().optional(),
  severity: z.enum(['low', 'moderate', 'high'] as const),
  resolved: z.boolean(),
  attachments: z.array(z.string()),
});

// Define the form values type
export type FormValues = z.infer<typeof formSchema>;

interface HealthLogFormProps {
  initialData?: HealthLogEntry;
  onSubmit: (data: CreateHealthLogEntryInput) => Promise<void>;
  onCancel: () => void;
}

export function HealthLogForm({ initialData, onSubmit, onCancel }: HealthLogFormProps) {
  
  const { 

    isLoading: healthStoreLoading
  } = useHealthStore();

  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })
 
  const { ReptileSelect } = useGroupedReptileSelect({filteredReptiles: reptiles});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_id: initialData?.reptile_id || '',
      org_id: initialData?.org_id || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      category_id: initialData?.category_id || '',
      subcategory_id: initialData?.subcategory_id || '',
      type_id: initialData?.type_id || null,
      custom_type_label: initialData?.custom_type_label || '',
      notes: initialData?.notes || '',
      severity: initialData?.severity || 'low',
      resolved: initialData?.resolved || false,
      attachments: initialData?.attachments || [],
    }
  });

 

  // Handle form submission
  const handleSubmit = async (data: FormValues) => {
    const {  ...formData } = data;
    await onSubmit(formData as CreateHealthLogEntryInput);
  };

  const isLoading =  healthStoreLoading;

  if (isLoading) {
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
        </div>

        <HealthCategorySelect form={form} className='grid gap-4'/>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resolved"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value ? 'resolved' : 'active'}
                  onValueChange={(value) => field.onChange(value === 'resolved')}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea {...field} value={field.value || ''} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Health Log
          </Button>
        </div>
      </form>
    </Form>
  );
}