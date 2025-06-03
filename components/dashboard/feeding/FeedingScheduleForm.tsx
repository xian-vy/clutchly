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
import { Reptile } from '@/lib/types/reptile';
import { AlertCircle, CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { useGroupedReptileMultiSelect } from '@/lib/hooks/useGroupedReptileMultiSelect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Location } from '@/lib/types/location';

// Define form schema
const feedingScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  recurrence: z.enum(['daily', 'weekly',  'interval']),
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
  occupiedLocations: Location[];
  rooms: { id: string; name: string }[];
  racks: { id: string; name: string; room_id: string }[];
  levels: { rack_id: string; level: number | string }[];
  reptiles: Reptile[];
  allSchedules: FeedingScheduleWithTargets[];
}

export function FeedingScheduleForm({
  initialData,
  onSubmit,
  onCancel,
  locations,
  occupiedLocations,
  rooms,
  racks,
  levels,
  reptiles,
  allSchedules,
}: FeedingScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set up form with default values
  const form = useForm<FeedingScheduleFormValues>({
    resolver: zodResolver(feedingScheduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      recurrence: initialData?.recurrence || 'weekly',
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
  
  
  const reptilesWithoutSchedule = reptiles.filter(reptile => {
    // If reptile has no location, it can't be part of any schedule
    if (!reptile.location_id) return true;

    // Get the reptile's location details
    const reptileLocation = occupiedLocations.find(loc => loc.id === reptile.location_id);
    if (!reptileLocation) return true;

    // Check if reptile is already targeted in any schedule
    return !allSchedules.some(schedule => {
      // Skip the current schedule if we're editing it
      if (initialData && schedule.id === initialData.id) return false;

      return schedule.targets.some(target => {
        switch (target.target_type) {
          case 'reptile':
            // Direct reptile target
            return target.target_id === reptile.id;
          case 'location':
            // Direct location target
            return target.target_id === reptile.location_id;
          case 'room':
            // Room target - check if reptile's location is in this room
            return target.target_id === reptileLocation.room_id;
          case 'rack':
            // Rack target - check if reptile's location is in this rack
            return target.target_id === reptileLocation.rack_id;
          case 'level':
            // Level target - check if reptile's location is at this level in the rack
            const [rackId, levelNumber] = target.target_id.split('-');
            return rackId === reptileLocation.rack_id && 
                   levelNumber === reptileLocation.shelf_level.toString();
          default:
            return false;
        }
      });
    });
  });

  const { MultiReptileSelect } = useGroupedReptileMultiSelect({reptiles: reptilesWithoutSchedule});
  
  // Handle form submission
  const handleSubmit = async (values: FeedingScheduleFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        name: values.name,
        description: values.description || null,
        recurrence: values.recurrence,
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
      <Alert variant="info">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only rack and room with reptiles assigned are displayed.
        </AlertDescription>
      </Alert>
        <div className="grid grid-cols-2  gap-2 sm:gap-4">
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
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild disabled={!!(initialData)}
                  >
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
          
         
        </div>

        <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div>
            <FormLabel className="block mb-2">Feeding Target</FormLabel>
            <Select
              disabled={!!(initialData)}
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
                {/* <SelectItem value="level">Feed by Rack Level</SelectItem> */}
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
                    <div className="flex flex-col gap-2">
                      {rooms.map((room) => (
                        <div key={room.id} className="flex items-center space-x-2">
                          <RadioGroup
                            disabled={!!(initialData)}
                            value={field.value.length > 0 ? field.value[0].target_id : ''}
                            onValueChange={(value) => {
                              field.onChange([
                                { target_type: 'room', target_id: value }
                              ]);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={room.id} id={`room-${room.id}`} />
                              <label
                                htmlFor={`room-${room.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {room.name}
                              </label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {targetType === 'rack' && (
                    <>
                      {/* Room Filter for Racks */}
                      <div className="mb-4">
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
                      
                      {/* Show Rack selection with checkboxes */}
                      <div className="flex flex-wrap gap-2">
                        {filteredRacks.map((rack) => (
                          <div key={rack.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`rack-${rack.id}`}
                              checked={field.value.some(target => 
                                target.target_type === 'rack' && target.target_id === rack.id
                              )}
                              onCheckedChange={(checked) => {
                                const currentValue = [...field.value];
                                if (checked) {
                                  field.onChange([
                                    ...currentValue,
                                    { target_type: 'rack', target_id: rack.id }
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      target => !(target.target_type === 'rack' && target.target_id === rack.id)
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`rack-${rack.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {rack.name}
                            </label>
                          </div>
                        ))}
                      </div>
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
                      
                      {/* Show Level selection with checkboxes */}
                      {selectedRackId && (
                        <div className="flex flex-wrap gap-2">
                          {filteredLevels.map((levelObj) => (
                            <div key={`${levelObj.rack_id}-${levelObj.level}`} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`level-${levelObj.rack_id}-${levelObj.level}`}
                                checked={field.value.some(target => 
                                  target.target_type === 'level' && 
                                  target.target_id === `${levelObj.rack_id}-${levelObj.level}`
                                )}
                                onCheckedChange={(checked) => {
                                  const currentValue = [...field.value];
                                  if (checked) {
                                    field.onChange([
                                      ...currentValue,
                                      { 
                                        target_type: 'level', 
                                        target_id: `${levelObj.rack_id}-${levelObj.level}` 
                                      }
                                    ]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter(
                                        target => !(
                                          target.target_type === 'level' && 
                                          target.target_id === `${levelObj.rack_id}-${levelObj.level}`
                                        )
                                      )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`level-${levelObj.rack_id}-${levelObj.level}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Level {levelObj.level}
                              </label>
                            </div>
                          ))}
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
                            {locations.map((location) => {
                              // Find reptiles in this location
                              const reptilesInLocation = reptiles.filter(r => r.location_id === location.id);
                              const reptileCount = reptilesInLocation.length;
                              
                              return (
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
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                      {field.value.some(
                                        target => target.target_type === 'location' && target.target_id === location.id
                                      ) && <Check className="mr-2 h-4 w-4" />}
                                      <div>
                                        <div className="font-medium">{location.label}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {reptileCount} reptile{reptileCount !== 1 ? 's' : ''} assigned
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
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


        {/* Name and Description */}
        <div className="grid grid-cols-1 gap-4">
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
                  disabled={!!(initialData)}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-1"
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
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Target Selection */}
        
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />}
            {initialData ? 'Update' : 'Create'} Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
}