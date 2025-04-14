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
import { Hatchling } from '@/lib/types/breeding';
import { createReptileFromHatchling } from '@/app/api/breeding/utils';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { getSpecies } from '@/app/api/reptiles/species';
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
});

interface HatchlingToReptileFormProps {
  hatchling: Hatchling;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HatchlingToReptileForm({
  hatchling,
  onSuccess,
  onCancel,
}: HatchlingToReptileFormProps) {
  const queryClient = useQueryClient();
  
  const { data: species = [] } = useQuery({
    queryKey: ['species'],
    queryFn: getSpecies,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      species: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createReptileFromHatchling(hatchling, values.name);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['reptiles'] });
      
      toast.success('Reptile created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating reptile:', error);
      toast.error('Failed to create reptile');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reptile Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter reptile name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {species.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Create Reptile</Button>
        </div>
      </form>
    </Form>
  );
} 