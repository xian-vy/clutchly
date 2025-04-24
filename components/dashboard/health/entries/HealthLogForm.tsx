'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useHealthStore } from '@/lib/stores/healthStore';
import { CreateHealthLogEntryInput, HealthLogEntry } from '@/lib/types/health';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the form schema to match the CreateHealthLogEntryInput type
const formSchema = z.object({
  reptile_id: z.string().min(1, 'Reptile is required'),
  user_id: z.string().optional(),
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
type FormValues = z.infer<typeof formSchema>;

interface HealthLogFormProps {
  initialData?: HealthLogEntry;
  onSubmit: (data: CreateHealthLogEntryInput) => Promise<void>;
  onCancel: () => void;
}

export function HealthLogForm({ initialData, onSubmit, onCancel }: HealthLogFormProps) {
  const [isCustomType, setIsCustomType] = useState(false);
  
  const { 
    categories, 
    getSubcategoriesByCategory,
    getTypesBySubcategory,
    isLoading: healthStoreLoading
  } = useHealthStore();

  const { ReptileSelect } = useGroupedReptileSelect()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_id: initialData?.reptile_id || '',
      user_id: initialData?.user_id || '',
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

  // Get subcategories and types based on selected category/subcategory
  const selectedCategoryId = form.watch('category_id');
  const selectedSubcategoryId = form.watch('subcategory_id');
  
  const subcategories = selectedCategoryId 
    ? getSubcategoriesByCategory(selectedCategoryId)
    : [];
  
  const types = selectedSubcategoryId
    ? getTypesBySubcategory(selectedSubcategoryId)
    : [];

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    form.setValue('category_id', categoryId);
    form.setValue('subcategory_id', '');
    form.setValue('type_id', null);
    form.setValue('custom_type_label', '');
    setIsCustomType(false);
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    form.setValue('subcategory_id', subcategoryId);
    form.setValue('type_id', null);
    form.setValue('custom_type_label', '');
    setIsCustomType(false);
  };

  // Handle type change
  const handleTypeChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomType(true);
      form.setValue('type_id', null);
    } else {
      setIsCustomType(false);
      form.setValue('type_id', value);
      form.setValue('custom_type_label', '');
    }
  };

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

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={handleCategoryChange}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a category" />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subcategory_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={handleSubcategoryChange}
                  disabled={!selectedCategoryId}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.label}
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
            name="type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  value={isCustomType ? 'custom' : (field.value || undefined)}
                  onValueChange={handleTypeChange}
                  disabled={!selectedSubcategoryId}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="custom">Custom Type</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {isCustomType && (
            <FormField
              control={form.control}
              name="custom_type_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Type Label</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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