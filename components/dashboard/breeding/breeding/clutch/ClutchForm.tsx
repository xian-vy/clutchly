'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { NewClutch } from '@/lib/types/breeding';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';


const formSchema = z.object({
  breeding_project_id: z.string().min(1, 'Breeding project is required'),
  lay_date: z.string().min(1, 'Lay date is required'),
  egg_count: z.coerce.number().min(1, 'Egg count must be at least 1'),
  fertile_count: z.coerce.number().optional(),
  incubation_status: z.enum(['not_started', 'in_progress', 'completed', 'failed'] as const),
  incubation_temp: z.coerce.number().optional(),
  incubation_humidity: z.coerce.number().optional(),
  hatch_date: z.string().optional(),
  notes: z.string().optional(),
});

interface ClutchFormProps {
  breedingProjectId: string;
  initialData?: Partial<NewClutch>;
  onSubmit: (data: NewClutch) => Promise<void>;
  onCancel: () => void;
}

export function ClutchForm({
  breedingProjectId,
  initialData,
  onSubmit,
  onCancel,
}: ClutchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      breeding_project_id: breedingProjectId,
      lay_date: new Date().toISOString().split('T')[0],
      egg_count: 0,
      fertile_count: undefined,
      incubation_status: 'not_started',
      incubation_temp: undefined,
      incubation_humidity: undefined,
      hatch_date: undefined,
      notes: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // Convert empty strings to undefined
    const formattedData = {
      ...data,
      fertile_count: data.fertile_count || undefined,
      incubation_temp: data.incubation_temp || undefined,
      incubation_humidity: data.incubation_humidity || undefined,
      hatch_date: data.hatch_date || undefined,
      notes: data.notes || undefined,
    };
    
    await onSubmit(formattedData as NewClutch);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="lay_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lay Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="egg_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Egg Count</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fertile_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fertile Count (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="incubation_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incubation Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="incubation_temp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C) (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incubation_humidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Humidity (%) (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hatch_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hatch Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Clutch' : 'Add Clutch'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 