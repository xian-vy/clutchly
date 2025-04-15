'use client';

import { getReptiles } from '@/app/api/reptiles/reptiles';
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
import { useReptilesParentsBySpecies } from '@/lib/hooks/useReptilesParentsBySpecies';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { BreedingProject, BreedingStatus, NewBreedingProject } from '@/lib/types/breeding';
import { Reptile } from '@/lib/types/reptile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breedingStatuses: BreedingStatus[] = ['planned', 'active', 'completed', 'failed'];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['planned', 'active', 'completed', 'failed']),
  male_id: z.string().min(1, 'Male reptile is required'),
  female_id: z.string().min(1, 'Female reptile is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  expected_hatch_date: z.string().optional(),
  notes: z.string().optional(),
  species_id: z.string().min(1, 'Species is required'),
});

interface BreedingProjectFormProps {
  initialData?: BreedingProject;
  onSubmit: (data: NewBreedingProject) => Promise<void>;
  onCancel: () => void;
}

export function BreedingProjectForm({
  initialData,
  onSubmit,
  onCancel,
}: BreedingProjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      name: initialData?.name || '',
      status: initialData?.status || 'planned',
      start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
      end_date: initialData?.end_date || new Date().toISOString().split('T')[0],
      expected_hatch_date: initialData?.expected_hatch_date || '',
      notes: initialData?.notes || '',
      species_id: initialData?.species_id?.toString() || '',
      male_id: initialData?.male_id || '',
      female_id: initialData?.female_id || '',
    },
  });

  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  const { species } = useSpeciesStore();
  const speciesId = form.watch('species_id');
  const { selectedSpeciesId, maleReptiles, femaleReptiles } = useReptilesParentsBySpecies({
    reptiles,
    speciesId : speciesId || '',
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // Convert empty date strings to undefined before submission
    const formattedData = {
      ...data,
      end_date: data.end_date || undefined,
      expected_hatch_date: data.expected_hatch_date || undefined,
    };
    
    await onSubmit(formattedData);
  };

  // Remove the old filter declarations
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {breedingStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="species_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value)
                  // Reset reptiles when species changes
                  form.setValue('male_id', '');
                  form.setValue('female_id', '')
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="male_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Male Reptile</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedSpeciesId}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select male" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maleReptiles.map((reptile) => (
                      <SelectItem key={reptile.id} value={reptile.id}>
                        {reptile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="female_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Female Reptile</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedSpeciesId}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select female" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {femaleReptiles.map((reptile) => (
                      <SelectItem key={reptile.id} value={reptile.id}>
                        {reptile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected_hatch_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Hatch Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}