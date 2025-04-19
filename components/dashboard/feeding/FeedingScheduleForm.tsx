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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { FeedingScheduleWithTargets, NewFeedingSchedule } from '@/lib/types/feeding';
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

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
        custom_days: values.recurrence === 'custom' ? values.custom_days : null,
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
                    <FormLabel className="font-normal">Custom Days</FormLabel>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Days</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${index}`}
                          checked={field.value?.includes(index)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, index]);
                            } else {
                              field.onChange(
                                currentValue.filter((day) => day !== index)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`day-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Start and End Dates */}
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
                        variant={"outline"}
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
                        variant={"outline"}
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
                      disabled={(date) => date < form.getValues().start_date}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Target Selection */}
        <div className="space-y-4">
          <div>
            <FormLabel className="block mb-2">Feeding Target Type</FormLabel>
            <Select
              value={targetType}
              onValueChange={(value: 'reptile' | 'location') => {
                setTargetType(value);
                form.setValue('targets', []); // Clear current targets when switching types
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="location">Feed by Location</SelectItem>
                <SelectItem value="reptile">Feed Specific Reptiles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <FormField
            control={form.control}
            name="targets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {targetType === 'location' ? 'Select Locations' : 'Select Reptiles'}
                </FormLabel>
                <FormControl>
                  {targetType === 'location' ? (
                    <div className="flex flex-wrap gap-2">
                      {locations.map((location) => (
                        <div key={location.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`location-${location.id}`}
                            checked={field.value.some(target => 
                              target.target_type === 'location' && target.target_id === location.id
                            )}
                            onCheckedChange={(checked) => {
                              const currentValue = [...field.value];
                              if (checked) {
                                field.onChange([
                                  ...currentValue,
                                  { target_type: 'location', target_id: location.id }
                                ]);
                              } else {
                                field.onChange(
                                  currentValue.filter(
                                    target => !(target.target_type === 'location' && target.target_id === location.id)
                                  )
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`location-${location.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {location.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {field.value.length === 0 
                              ? "Select reptiles" 
                              : `${field.value.length} reptile${field.value.length > 1 ? 's' : ''} selected`}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search reptiles..." />
                            <CommandEmpty>No reptiles found.</CommandEmpty>
                            <CommandGroup>
                              {reptiles.map((reptile) => (
                                <CommandItem
                                  key={reptile.id}
                                  value={reptile.id}
                                  onSelect={() => {
                                    const currentValue = [...field.value];
                                    const exists = currentValue.some(
                                      target => target.target_type === 'reptile' && target.target_id === reptile.id
                                    );
                                    
                                    if (exists) {
                                      field.onChange(
                                        currentValue.filter(
                                          target => !(target.target_type === 'reptile' && target.target_id === reptile.id)
                                        )
                                      );
                                    } else {
                                      field.onChange([
                                        ...currentValue,
                                        { target_type: 'reptile', target_id: reptile.id }
                                      ]);
                                    }
                                  }}
                                >
                                  <div className="flex items-center">
                                    {field.value.some(
                                      target => target.target_type === 'reptile' && target.target_id === reptile.id
                                    ) && <Check className="mr-2 h-4 w-4" />}
                                    {reptile.name}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update' : 'Create'} Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
} 