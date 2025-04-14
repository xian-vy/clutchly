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
import { NewHatchling } from '@/lib/types/breeding';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  morph: z.string().min(1, 'Morph is required'),
  sex: z.enum(['male', 'female', 'unknown']),
  weight: z.coerce.number().min(0, 'Weight must be positive'),
  notes: z.string().optional(),
});

interface HatchlingFormProps {
  clutchId: string;
  onSubmit: (data: NewHatchling) => Promise<void>;
  onCancel: () => void;
}

export function HatchlingForm({
  clutchId,
  onSubmit,
  onCancel,
}: HatchlingFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      morph: '',
      sex: 'unknown',
      weight: 0,
      notes: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const hatchlingData: NewHatchling = {
      ...data,
      clutch_id: clutchId,
    };
    await onSubmit(hatchlingData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="morph"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Morph</FormLabel>
              <FormControl>
                <Input placeholder="Enter morph" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
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
                <Input type="number" step="0.01" min="0" {...field} />
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
          <Button type="submit">Add Hatchling</Button>
        </div>
      </form>
    </Form>
  );
} 