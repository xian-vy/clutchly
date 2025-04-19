'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { FeedingScheduleWithTargets, NewFeedingSchedule } from '@/lib/types/feeding';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define form schema
const feedingScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  recurrence: z.enum(['daily', 'weekly', 'custom']),
  custom_days: z.array(z.number()).optional(),
  start_date: z.date(),
  end_date: z.date().optional().nullable(),
  targets: z.array(
    z.object({
      target_type: z.enum(['location', 'reptile']),
      target_id: z.string(),
    })
  ).min(1, 'At least one target is required'),
});

type FeedingScheduleFormValues = z.infer<typeof feedingScheduleSchema>;

interface FeedingScheduleFormProps {
  initialData?: FeedingScheduleWithTargets;
  onSubmit: (data: NewFeedingSchedule & { targets: { target_type: 'reptile' | 'location', target_id: string }[] }) => Promise<void>;
  onCancel: () => void;
  reptiles: { id: string; name: string }[];
  locations: { id: string; label: string }[];
}

export function FeedingScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  reptiles,
  locations,
}: FeedingScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with default values
  const form = useForm<FeedingScheduleFormValues>({
    resolver: zodResolver(feedingScheduleSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || '',
          recurrence: initialData.recurrence,
          custom_days: initialData.custom_days || [],
          start_date: new Date(initialData.start_date),
          end_date: initialData.end_date ? new Date(initialData.end_date) : null,
          targets: initialData.targets.map(target => ({
            target_type: target.target_type,
            target_id: target.target_id,
          })),
        }
      : {
          name: '',
          description: '',
          recurrence: 'weekly',
          custom_days: [],
          start_date: new Date(),
          end_date: null,
          targets: [],
        },
  });
  
  // Handle target type change
  const [targetType, setTargetType] = useState<'reptile' | 'location'>(
    form.getValues().targets.length > 0 && form.getValues().targets[0]?.target_type === 'location'
      ? 'location'
      : 'reptile'
  );
  
  // Get recurrence value from form
  const recurrence = form.watch('recurrence');
  
  // When recurrence changes, update custom days if needed
  useEffect(() => {
    if (recurrence !== 'custom') {
      form.setValue('custom_days', []);
    } else if (form.getValues('custom_days')?.length === 0) {
      form.setValue('custom_days', [1, 3, 5]); // Default to Mon, Wed, Fri
    }
  }, [recurrence, form]);
  
  // Handle form submission
  const handleSubmit = async (values: FeedingScheduleFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        description: values.description || null,
        recurrence: values.recurrence,
        custom_days: values.recurrence === 'custom' ? values.custom_days || [] : null,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null,
        targets: values.targets,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name and Description */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Name</FormLabel>
                <FormControl>
                  <Input placeholder="Weekly Feed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Notes about this feeding schedule" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Recurrence */}
        <FormField
          control={form.control}
          name="recurrence"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Feeding Frequency</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">Daily</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="weekly" />
                    </FormControl>
                    <FormLabel className="font-normal">Weekly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Custom Days Selection */}
        {recurrence === 'custom' && (
          <FormField
            control={form.control}
            name="custom_days"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Select Days</FormLabel>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'Sunday', value: 0 },
                    { label: 'Monday', value: 1 },
                    { label: 'Tuesday', value: 2 },
                    { label: 'Wednesday', value: 3 },
                    { label: 'Thursday', value: 4 },
                    { label: 'Friday', value: 5 },
                    { label: 'Saturday', value: 6 },
                  ].map((day) => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="custom_days"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  const newValue = checked
                                    ? [...currentValue, day.value]
                                    : currentValue.filter((value) => value !== day.value);
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Start Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* End Date (Optional) */}
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>No end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Target Selection - Reptile vs Location */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <FormLabel>Apply Schedule To</FormLabel>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={targetType === 'reptile' ? 'default' : 'outline'}
                onClick={() => setTargetType('reptile')}
              >
                Reptiles
              </Button>
              <Button
                type="button"
                variant={targetType === 'location' ? 'default' : 'outline'}
                onClick={() => setTargetType('location')}
              >
                Locations
              </Button>
            </div>
          </div>
          
          {/* Target Selection */}
          <FormField
            control={form.control}
            name="targets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {targetType === 'reptile' ? 'Select Reptiles' : 'Select Locations'}
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 gap-4">
                    {targetType === 'reptile' ? (
                      // Reptile Selection
                      <div className="space-y-2">
                        {reptiles.map(reptile => (
                          <div
                            key={reptile.id}
                            className="flex items-center space-x-3 border p-3 rounded-md"
                          >
                            <Checkbox
                              checked={field.value.some(
                                t => t.target_type === 'reptile' && t.target_id === reptile.id
                              )}
                              onCheckedChange={checked => {
                                const currentValue = [...field.value];
                                if (checked) {
                                  // Add reptile to targets
                                  if (!currentValue.some(t => t.target_id === reptile.id && t.target_type === 'reptile')) {
                                    currentValue.push({ target_type: 'reptile', target_id: reptile.id });
                                  }
                                } else {
                                  // Remove reptile from targets
                                  const index = currentValue.findIndex(
                                    t => t.target_type === 'reptile' && t.target_id === reptile.id
                                  );
                                  if (index !== -1) {
                                    currentValue.splice(index, 1);
                                  }
                                }
                                field.onChange(currentValue);
                              }}
                            />
                            <span>{reptile.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Location Selection
                      <div className="space-y-2">
                        {locations.map(location => (
                          <div
                            key={location.id}
                            className="flex items-center space-x-3 border p-3 rounded-md"
                          >
                            <Checkbox
                              checked={field.value.some(
                                t => t.target_type === 'location' && t.target_id === location.id
                              )}
                              onCheckedChange={checked => {
                                const currentValue = [...field.value];
                                if (checked) {
                                  // Add location to targets
                                  if (!currentValue.some(t => t.target_id === location.id && t.target_type === 'location')) {
                                    currentValue.push({ target_type: 'location', target_id: location.id });
                                  }
                                } else {
                                  // Remove location from targets
                                  const index = currentValue.findIndex(
                                    t => t.target_type === 'location' && t.target_id === location.id
                                  );
                                  if (index !== -1) {
                                    currentValue.splice(index, 1);
                                  }
                                }
                                field.onChange(currentValue);
                              }}
                            />
                            <span>{location.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Schedule'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 