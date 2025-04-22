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
import { FeedingScheduleWithTargets, NewFeedingSchedule, TargetType } from '@/lib/types/feeding';
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { useMultiReptileSelect } from '@/lib/hooks/useMultiReptileSelect';

// Define form schema
const feedingScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  recurrence: z.enum(['daily', 'weekly', 'custom', 'interval']),
  custom_days: z.array(z.number()).optional(),
  interval_days: z.number().min(1).optional(),
  start_date: z.date(),
  end_date: z.date().optional().nullable(),
  targets: z.array(
    z.object({
      target_type: z.enum(['room', 'rack', 'level', 'location', 'reptile']),
      target_id: z.string(),
    })
  ).min(1, 'At least one target is required'),
});

type FeedingScheduleFormValues = z.infer<typeof feedingScheduleSchema>;

interface FeedingScheduleFormProps {
  initialData?: FeedingScheduleWithTargets;
  onSubmit: (data: NewFeedingSchedule & { targets: { target_type: TargetType, target_id: string }[] }) => Promise<void>;
  onCancel: () => void;
  locations: { id: string; label: string }[];
  rooms: { id: string; name: string }[];
  racks: { id: string; name: string; room_id: string }[];
  levels: { rack_id: string; level: number | string }[];
}

export function FeedingScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  locations,
  rooms,
  racks,
  levels,
}: FeedingScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with default values
  const form = useForm<FeedingScheduleFormValues>({
    resolver: zodResolver(feedingScheduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      recurrence: initialData?.recurrence || 'weekly',
      custom_days: initialData?.custom_days || [],
      interval_days: initialData?.interval_days || undefined,
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : null,
      targets: initialData?.targets.map(target => ({
        target_type: target.target_type,
        target_id: target.target_id,
      })) || [],
    },
  });
  
  // Handle target type change
  const [targetType, setTargetType] = useState<TargetType>(
    form.getValues().targets.length > 0 
      ? form.getValues().targets[0]?.target_type 
      : 'reptile'
  );

  // For filtering rack and level selections
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  // Filter racks by selected room
  const filteredRacks = selectedRoomId 
    ? racks.filter(rack => rack.room_id === selectedRoomId)
    : racks;
  
  // Filter levels by selected rack
  const filteredLevels = selectedRackId
    ? levels.filter(level => level.rack_id === selectedRackId)
    : levels;
  
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
  
  const { MultiReptileSelect } = useMultiReptileSelect();
  
  // Handle form submission
  const handleSubmit = async (values: FeedingScheduleFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        name: values.name,
        description: values.description || null,
        recurrence: values.recurrence,
        custom_days: values.recurrence === 'custom' ? values.custom_days || [] : null,
        interval_days: values.recurrence === 'interval' ? values.interval_days || null : null,
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 xl:space-y-4 2xl:space-y-6">
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
            <FormItem>
              <FormLabel>Recurrence</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">Daily</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="weekly" />
                    </FormControl>
                    <FormLabel className="font-normal">Weekly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom Days</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="interval" />
                    </FormControl>
                    <FormLabel className="font-normal">Interval</FormLabel>
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
                <FormLabel>Custom Days</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <Checkbox
                        key={day}
                        checked={field.value?.includes(day)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(field.value || []), day]
                            : (field.value || []).filter((d) => d !== day);
                          field.onChange(newValue);
                        }}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Interval Days Selection */}
        {recurrence === 'interval' && (
          <FormField
            control={form.control}
            name="interval_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interval (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter number of days"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel className="block mb-2">Feeding Target Type</FormLabel>
            <Select
              value={targetType}
              onValueChange={(value: TargetType) => {
                setTargetType(value);
                form.setValue('targets', []); // Clear current targets when switching types
                // Reset selected room and rack when changing target type
                if (value !== 'level' && value !== 'rack') {
                  setSelectedRackId(null);
                }
                if (value !== 'rack' && value !== 'room') {
                  setSelectedRoomId(null);
                }
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="room">Feed by Room</SelectItem>
                <SelectItem value="rack">Feed by Rack</SelectItem>
                <SelectItem value="level">Feed by Rack Level</SelectItem>
                {/* <SelectItem value="location">Feed by Specific Enclosure</SelectItem> */}
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
                  {targetType === 'room' ? 'Select Rooms' : 
                   targetType === 'rack' ? 'Select Racks' :
                   targetType === 'level' ? 'Select Levels' :
                   targetType === 'location' ? 'Select Enclosures' : 'Select Reptiles'}
                </FormLabel>
                <div>
                  {targetType === 'room' && (
                    <div className="flex flex-wrap gap-2">
                      {rooms.map((room) => (
                        <div key={room.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`room-${room.id}`}
                            checked={field.value.some(target => 
                              target.target_type === 'room' && target.target_id === room.id
                            )}
                            onCheckedChange={(checked) => {
                              const currentValue = [...field.value];
                              if (checked) {
                                field.onChange([
                                  ...currentValue,
                                  { target_type: 'room', target_id: room.id }
                                ]);
                              } else {
                                field.onChange(
                                  currentValue.filter(
                                    target => !(target.target_type === 'room' && target.target_id === room.id)
                                  )
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`room-${room.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {room.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {targetType === 'rack' && (
                    <>
                      {/* Room Filter for Racks */}
                      <div className="mb-4">
                        <FormLabel className="text-sm text-muted-foreground">Filter by Room (Optional)</FormLabel>
                        <Select
                          value={selectedRoomId || "all"}
                          onValueChange={(value) => setSelectedRoomId(value === "all" ? null : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Rooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Rooms</SelectItem>
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Show Rack filter only if a room is selected */}
                      {selectedRoomId && (
                        <div className="mb-4">
                          <FormLabel className="text-sm text-muted-foreground">Filter by Rack (Optional)</FormLabel>
                          <Select
                            value={selectedRackId || "all"}
                            onValueChange={(value) => setSelectedRackId(value === "all" ? null : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Racks" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Racks</SelectItem>
                              {filteredRacks.map((rack) => (
                                <SelectItem key={rack.id} value={rack.id}>
                                  {rack.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                  
                  {targetType === 'level' && (
                    <>
                      {/* Rack Filter for Levels */}
                      <div className="mb-4">
                        <FormLabel className="text-sm text-muted-foreground">Select Rack</FormLabel>
                        <Select
                          value={selectedRackId || ""}
                          onValueChange={(value) => setSelectedRackId(value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Rack" />
                          </SelectTrigger>
                          <SelectContent>
                            {racks.map((rack) => (
                              <SelectItem key={rack.id} value={rack.id}>
                                {rack.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Show Level filter only if a rack is selected */}
                      {selectedRackId && (
                        <div className="mb-4">
                          <FormLabel className="text-sm text-muted-foreground">Filter by Level (Optional)</FormLabel>
                          <Select
                            value={selectedLevel || "all"}
                            onValueChange={(value) => setSelectedLevel(value === "all" ? null : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              {filteredLevels.map((levelObj) => (
                                <SelectItem key={`${levelObj.rack_id}-${levelObj.level}`} value={`${levelObj.level}`}>
                                  Level {levelObj.level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                  
                  {targetType === 'location' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {field.value.length === 0 
                            ? "Select enclosures" 
                            : `${field.value.length} enclosure${field.value.length > 1 ? 's' : ''} selected`}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search enclosures..." />
                          <CommandEmpty>No enclosures found.</CommandEmpty>
                          <CommandGroup>
                            {locations.map((location) => (
                              <CommandItem
                                key={location.id}
                                value={location.id}
                                onSelect={() => {
                                  const currentValue = [...field.value];
                                  const exists = currentValue.some(
                                    target => target.target_type === 'location' && target.target_id === location.id
                                  );
                                  
                                  if (exists) {
                                    field.onChange(
                                      currentValue.filter(
                                        target => !(target.target_type === 'location' && target.target_id === location.id)
                                      )
                                    );
                                  } else {
                                    field.onChange([
                                      ...currentValue,
                                      { target_type: 'location', target_id: location.id }
                                    ]);
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  {field.value.some(
                                    target => target.target_type === 'location' && target.target_id === location.id
                                  ) && <Check className="mr-2 h-4 w-4" />}
                                  {location.label}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  
                  {targetType === 'reptile' && (
                    <FormField
                      control={form.control}
                      name="targets"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <MultiReptileSelect
                              value={field.value.filter(target => target.target_type === 'reptile')}
                              onChange={(newValue) => {
                                // Keep other target types (room, rack, level, location)
                                const otherTargets = field.value.filter(target => target.target_type !== 'reptile');
                                field.onChange([...otherTargets, ...newValue]);
                              }}
                              placeholder="Select reptiles..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
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