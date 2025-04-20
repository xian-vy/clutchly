'use client';

import { createFeedingEvent, getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, Loader2, MapPin, PlusCircle, RefreshCw, Save, Turtle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FeedingEventsListProps {
  scheduleId: string;
  schedule: FeedingScheduleWithTargets;
  onEventsUpdated?: () => void;
}

// Interface for virtual events that don't exist in the DB yet
interface VirtualFeedingEvent {
  virtual: true;
  reptile_id: string;
  scheduled_date: string;
  reptile_name: string;
  species_name: string;
  morph_name: string;
}

export function FeedingEventsList({ scheduleId, schedule, onEventsUpdated }: FeedingEventsListProps) {
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  const [creatingVirtualEvent, setCreatingVirtualEvent] = useState<boolean>(false);
  const [reptilesByLocation, setReptilesByLocation] = useState<Reptile[]>([]);
  const [isLoadingReptiles, setIsLoadingReptiles] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<FeedingTargetWithDetails | null>(null);
  const [sortBy, setSortBy] = useState<'species' | 'name' | 'morph'>('name');
  const queryClient = useQueryClient();
  
  // Fetch feeding events for this schedule using tanstack query
  const { 
    data: events = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['feeding-events', scheduleId],
    queryFn: async () => {
      const eventsData = await getFeedingEvents(scheduleId);
      
      // Initialize notes for each event
      const notesMap: Record<string, string> = {};
      eventsData.forEach(event => {
        notesMap[event.id] = event.notes || '';
      });
      setEventNotes(notesMap);
      
      return eventsData;
    },
    staleTime: 30000, // 30 seconds
  });

  // Load reptiles for the first target when component mounts
  useEffect(() => {
    console.log("Schedule targets:", schedule?.targets);
    if (schedule?.targets?.length > 0 && !activeTarget) {
      const firstTarget = schedule.targets[0];
      console.log("Setting active target to first target:", firstTarget);
      setActiveTarget(firstTarget);
    }
  }, [schedule, activeTarget]);

  // Load reptiles when activeTarget changes
  useEffect(() => {
    if (activeTarget) {
      loadReptilesByTarget(activeTarget);
    }
  }, [activeTarget]);

  // Add a retry button functionality
  const handleRetryLoadReptiles = () => {
    if (activeTarget) {
      loadReptilesByTarget(activeTarget);
    }
  };

  // Function to load reptiles based on target
  const loadReptilesByTarget = async (target: FeedingTargetWithDetails) => {
    setIsLoadingReptiles(true);
    setReptilesByLocation([]); // Clear previous reptiles while loading
    
    try {
      console.log("Loading reptiles for target:", target);
      
      // If target type is 'reptile', handle it directly
      if (target.target_type === 'reptile') {
        // For reptile target, we just need that single reptile
        try {
          const reptile = await getReptileById(target.target_id);
          console.log("Loaded single reptile:", reptile);
          setReptilesByLocation([reptile]);
        } catch (error) {
          console.error('Error fetching reptile:', error);
          toast.error(`Failed to fetch reptile: ${(error as any)?.message || 'Unknown error'}`);
          setReptilesByLocation([]);
        }
      } else {
        // For location-based targets, use the API function
        console.log(`Fetching reptiles by ${target.target_type} with ID: ${target.target_id}`);
        try {
          const reptiles = await getReptilesByLocation(
            target.target_type as 'room' | 'rack' | 'level' | 'location', 
            target.target_id
          );
          console.log(`Found ${reptiles?.length || 0} reptiles for ${target.target_type}:`, reptiles);
          setReptilesByLocation(reptiles || []);
        } catch (error) {
          console.error(`Error fetching reptiles by ${target.target_type}:`, error);
          toast.error(`Failed to fetch reptiles by ${target.target_type}: ${(error as any)?.message || 'Unknown error'}`);
          setReptilesByLocation([]);
        }
      }
    } catch (error) {
      console.error('Error loading reptiles:', error);
      toast.error('Failed to load reptiles for target');
      setReptilesByLocation([]);
    } finally {
      setIsLoadingReptiles(false);
    }
  };
  
  // Generate virtual events based on schedule
  const { data: virtualEvents = [] } = useQuery({
    queryKey: ['virtual-feeding-events', scheduleId, activeTarget?.id],
    queryFn: async () => {
      // No target selected or loading reptiles
      if (!activeTarget || isLoadingReptiles || reptilesByLocation.length === 0) {
        console.log("Not generating virtual events - no active target, loading reptiles, or no reptiles found");
        return [];
      }

      const today = startOfDay(new Date());
      const virtualEvents: VirtualFeedingEvent[] = [];
      
      // Create today's virtual events if needed
      const todayString = format(today, 'yyyy-MM-dd');
      const todayEvents = events.filter(e => e.scheduled_date === todayString);
      console.log(`Checking for today's (${todayString}) events:`, todayEvents.length, todayEvents);
      
      // Check if we should feed today based on schedule
      const shouldFeedToday = shouldHaveFeedingToday(schedule);
      console.log("Should feed today according to schedule:", shouldFeedToday);
      
      if (shouldFeedToday) {
        console.log("Generating virtual events for reptiles:", reptilesByLocation.length);
        // Create virtual events for each reptile that doesn't already have an event
        for (const reptile of reptilesByLocation) {
          const reptileHasEventToday = todayEvents.some(e => e.reptile_id === reptile.id);
          
          if (!reptileHasEventToday) {
            // Get species and morph information - first try to get from the reptile object itself
            // as the updated API now includes this information
            const speciesName = (reptile as any).species_name || 
                             events.find(e => e.reptile_id === reptile.id)?.species_name || 
                             'Unknown';
            const morphName = (reptile as any).morph_name || 
                           events.find(e => e.reptile_id === reptile.id)?.morph_name || 
                           'Unknown';
            
            console.log(`Creating virtual event for reptile ${reptile.id} (${reptile.name})`);
            virtualEvents.push({
              virtual: true,
              reptile_id: reptile.id,
              scheduled_date: todayString,
              reptile_name: reptile.name,
              species_name: speciesName,
              morph_name: morphName
            });
          } else {
            console.log(`Reptile ${reptile.id} (${reptile.name}) already has an event for today`);
          }
        }
      }
      
      console.log(`Generated ${virtualEvents.length} virtual events`);
      return virtualEvents;
    },
    enabled: !!activeTarget && !isLoadingReptiles,
    staleTime: 60000, // 1 minute
  });
  
  // Determine if feeding should happen today based on schedule
  const shouldHaveFeedingToday = (schedule: FeedingScheduleWithTargets): boolean => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6, Sunday-Saturday
    
    if (schedule.recurrence === 'daily') {
      return true;
    } else if (schedule.recurrence === 'weekly') {
      const startDate = new Date(schedule.start_date);
      const startDayOfWeek = startDate.getDay();
      return dayOfWeek === startDayOfWeek;
    } else if (schedule.recurrence === 'custom' && schedule.custom_days) {
      return schedule.custom_days.includes(dayOfWeek);
    }
    
    return false;
  };
  
  // Convert a virtual event to a real event
  const createRealEventFromVirtual = async (virtualEvent: VirtualFeedingEvent, fed: boolean = true) => {
    setCreatingVirtualEvent(true);
    try {
      const newEvent = await createFeedingEvent({
        schedule_id: scheduleId,
        reptile_id: virtualEvent.reptile_id,
        scheduled_date: virtualEvent.scheduled_date,
        fed,
        fed_at: fed ? new Date().toISOString() : null,
        notes: null
      });
      
      toast.success("Feeding recorded");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['feeding-events', scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
      queryClient.invalidateQueries({ queryKey: ['virtual-feeding-events', scheduleId, activeTarget?.id] });
      
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error creating feeding event:', error);
      toast.error('Failed to record feeding');
    } finally {
      setCreatingVirtualEvent(false);
    }
  };
  
  // Update a feeding event (mark as fed/unfed)
  const handleUpdateEvent = async (eventId: string, fed: boolean) => {
    setUpdatingEventId(eventId);
    try {
      const notes = eventNotes[eventId];
      const updatedEvent = await updateFeedingEvent(eventId, {
        fed,
        notes: notes || null
      });
      
      // Update the cache
      queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
        if (!oldData) return [updatedEvent];
        return oldData.map(event => event.id === eventId ? { ...event, ...updatedEvent } : event);
      });
      
      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
      
      toast.success(`Feeding ${fed ? 'completed' : 'unmarked'}`);
      
      // Call the onEventsUpdated callback to refresh the parent component
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error updating feeding event:', error);
      toast.error('Failed to update feeding status');
    } finally {
      setUpdatingEventId(null);
    }
  };
  
  // Handle notes change
  const handleNotesChange = (eventId: string, notes: string) => {
    setEventNotes(currentNotes => ({
      ...currentNotes,
      [eventId]: notes
    }));
  };
  
  // Save notes for an event
  const handleSaveNotes = async (eventId: string) => {
    setUpdatingEventId(eventId);
    try {
      const notes = eventNotes[eventId];
      const updatedEvent = await updateFeedingEvent(eventId, {
        notes: notes || null
      });
      
      // Update the cache
      queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
        if (!oldData) return [updatedEvent];
        return oldData.map(event => event.id === eventId ? { ...event, ...updatedEvent } : event);
      });
      
      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
      
      toast.success('Notes saved successfully');
      
      // Call the onEventsUpdated callback
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setUpdatingEventId(null);
    }
  };
  
  // Sort reptiles based on selected criteria
  const getSortedReptiles = (reptiles: (FeedingEventWithDetails | VirtualFeedingEvent)[]) => {
    return [...reptiles].sort((a, b) => {
      if (sortBy === 'name') {
        return a.reptile_name.localeCompare(b.reptile_name);
      } else if (sortBy === 'species') {
        return a.species_name.localeCompare(b.species_name);
      } else {
        return a.morph_name.localeCompare(b.morph_name);
      }
    });
  };

  // Handle view change (switch between location targets)
  const handleTargetChange = (targetId: string) => {
    const selectedTarget = schedule.targets.find(t => t.id === targetId);
    if (selectedTarget) {
      setActiveTarget(selectedTarget);
    }
  };

  if (isLoading || isLoadingReptiles) {
    return (
      <Card className="min-h-[200px] border-0 shadow-none">
        <CardContent className="flex justify-center items-center h-full py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Filter events for the selected location
  console.log("All events before filtering:", events.length, events);
  console.log("Reptiles by location:", reptilesByLocation.length, reptilesByLocation);
  
  const filteredEvents = activeTarget 
    ? events.filter(event => {
        const reptile = reptilesByLocation.find(r => r.id === event.reptile_id);
        const isMatched = !!reptile;
        if (!isMatched) {
          console.log(`Event for reptile ${event.reptile_id} (${event.reptile_name}) filtered out - not in current location target`);
        }
        return isMatched;
      })
    : events;
  
  console.log("Filtered events:", filteredEvents.length, filteredEvents);
  
  // Combine real and virtual events
  const allEvents = [...filteredEvents, ...virtualEvents];
  console.log("All events after combining with virtual:", allEvents.length, allEvents);
  
  if (schedule.targets.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No feeding targets defined</AlertTitle>
        <AlertDescription>
          This schedule doesn't have any targets defined. Add rooms, racks, levels, or specific locations to this schedule.
        </AlertDescription>
      </Alert>
    );
  }

  if (allEvents.length === 0 && reptilesByLocation.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-2">Select Target Location</h3>
            <Select 
              value={activeTarget?.id || ''}
              onValueChange={handleTargetChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target location" />
              </SelectTrigger>
              <SelectContent>
                {schedule.targets.map(target => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.target_type === 'room' && target.room_name && (
                      <>Room: {target.room_name}</>
                    )}
                    {target.target_type === 'rack' && target.rack_name && (
                      <>Rack: {target.rack_name}</>
                    )}
                    {target.target_type === 'level' && target.rack_name && (
                      <>Level: {target.rack_name} - {target.level_number}</>
                    )}
                    {target.target_type === 'location' && target.location_label && (
                      <>Location: {target.location_label}</>
                    )}
                    {target.target_type === 'reptile' && target.reptile_name && (
                      <>Reptile: {target.reptile_name}</>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      refetch();
                      if (activeTarget) loadReptilesByTarget(activeTarget);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Card className="mb-4 bg-muted/20">
          <CardContent className="py-3 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-sm font-medium">Current Target:</span>{' '}
                <Badge variant="outline">
                  {activeTarget?.target_type === 'room' && activeTarget.room_name && (
                    <>Room: {activeTarget.room_name}</>
                  )}
                  {activeTarget?.target_type === 'rack' && activeTarget.rack_name && (
                    <>Rack: {activeTarget.rack_name}</>
                  )}
                  {activeTarget?.target_type === 'level' && activeTarget.rack_name && (
                    <>Level: {activeTarget.rack_name} - {activeTarget.level_number}</>
                  )}
                  {activeTarget?.target_type === 'location' && activeTarget.location_label && (
                    <>Location: {activeTarget.location_label}</>
                  )}
                  {activeTarget?.target_type === 'reptile' && activeTarget.reptile_name && (
                    <>Reptile: {activeTarget.reptile_name}</>
                  )}
                  {!activeTarget && <>None selected</>}
                </Badge>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {activeTarget ? "1 location" : "0 locations"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Turtle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {reptilesByLocation.length} reptile
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
            <div className="text-muted-foreground font-medium mb-2">No reptiles found in this location</div>
            <div className="text-sm text-muted-foreground mb-4">
              {activeTarget ? (
                <>
                  There are no reptiles assigned to {activeTarget.target_type === 'room' ? 'Room ' + activeTarget.room_name : 
                    activeTarget.target_type === 'rack' ? 'Rack ' + activeTarget.rack_name : 
                    activeTarget.target_type === 'level' ? 'Level ' + activeTarget.level_number + ' in ' + activeTarget.rack_name : 
                    activeTarget.target_type === 'location' ? 'Location ' + activeTarget.location_label : 
                    'this location'}.
                </>
              ) : (
                <>
                  Please select a target location or add reptiles to this location.
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryLoadReptiles}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (allEvents.length === 0 && reptilesByLocation.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-2">Select Target Location</h3>
            <Select 
              value={activeTarget?.id || ''}
              onValueChange={handleTargetChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target location" />
              </SelectTrigger>
              <SelectContent>
                {schedule.targets.map(target => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.target_type === 'room' && target.room_name && (
                      <>Room: {target.room_name}</>
                    )}
                    {target.target_type === 'rack' && target.rack_name && (
                      <>Rack: {target.rack_name}</>
                    )}
                    {target.target_type === 'level' && target.rack_name && (
                      <>Level: {target.rack_name} - {target.level_number}</>
                    )}
                    {target.target_type === 'location' && target.location_label && (
                      <>Location: {target.location_label}</>
                    )}
                    {target.target_type === 'reptile' && target.reptile_name && (
                      <>Reptile: {target.reptile_name}</>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <Select 
              value={sortBy}
              onValueChange={(value) => setSortBy(value as 'species' | 'name' | 'morph')}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Reptile Name</SelectItem>
                <SelectItem value="species">Species</SelectItem>
                <SelectItem value="morph">Morph</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      refetch();
                      if (activeTarget) loadReptilesByTarget(activeTarget);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Card className="mb-4 bg-muted/20">
          <CardContent className="py-3 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-sm font-medium">Current Target:</span>{' '}
                <Badge variant="outline">
                  {activeTarget?.target_type === 'room' && activeTarget.room_name && (
                    <>Room: {activeTarget.room_name}</>
                  )}
                  {activeTarget?.target_type === 'rack' && activeTarget.rack_name && (
                    <>Rack: {activeTarget.rack_name}</>
                  )}
                  {activeTarget?.target_type === 'level' && activeTarget.rack_name && (
                    <>Level: {activeTarget.rack_name} - {activeTarget.level_number}</>
                  )}
                  {activeTarget?.target_type === 'location' && activeTarget.location_label && (
                    <>Location: {activeTarget.location_label}</>
                  )}
                  {activeTarget?.target_type === 'reptile' && activeTarget.reptile_name && (
                    <>Reptile: {activeTarget.reptile_name}</>
                  )}
                  {!activeTarget && <>None selected</>}
                </Badge>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {activeTarget ? "1 location" : "0 locations"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Turtle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {reptilesByLocation.length} reptile{reptilesByLocation.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
            <div className="text-muted-foreground font-medium mb-2">No feeding events yet</div>
            <div className="text-sm text-muted-foreground mb-4">
              Found {reptilesByLocation.length} reptile{reptilesByLocation.length !== 1 ? 's' : ''} in {' '}
              {activeTarget?.target_type === 'room' ? 'Room ' + activeTarget.room_name : 
                activeTarget?.target_type === 'rack' ? 'Rack ' + activeTarget.rack_name : 
                activeTarget?.target_type === 'level' ? 'Level ' + activeTarget.level_number + ' in ' + activeTarget.rack_name : 
                activeTarget?.target_type === 'location' ? 'Location ' + activeTarget.location_label : 
                activeTarget?.target_type === 'reptile' ? 'Reptile ' + activeTarget.reptile_name :
                'this location'}, but no feeding events have been generated yet.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Refresh the data
                refetch();
                if (activeTarget) loadReptilesByTarget(activeTarget);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Group events by date
  const eventsByDate: Record<string, (FeedingEventWithDetails | VirtualFeedingEvent)[]> = {};
  allEvents.forEach(event => {
    const date = event.scheduled_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });
  
  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()  // Newest dates first
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Select Target Location</h3>
          <Select 
            value={activeTarget?.id || ''}
            onValueChange={handleTargetChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select target location" />
            </SelectTrigger>
            <SelectContent>
              {schedule.targets.map(target => (
                <SelectItem key={target.id} value={target.id}>
                  {target.target_type === 'room' && target.room_name && (
                    <>Room: {target.room_name}</>
                  )}
                  {target.target_type === 'rack' && target.rack_name && (
                    <>Rack: {target.rack_name}</>
                  )}
                  {target.target_type === 'level' && target.rack_name && (
                    <>Level: {target.rack_name} - {target.level_number}</>
                  )}
                  {target.target_type === 'location' && target.location_label && (
                    <>Location: {target.location_label}</>
                  )}
                  {target.target_type === 'reptile' && target.reptile_name && (
                    <>Reptile: {target.reptile_name}</>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Sort By</h3>
          <Select 
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'species' | 'name' | 'morph')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Reptile Name</SelectItem>
              <SelectItem value="species">Species</SelectItem>
              <SelectItem value="morph">Morph</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    refetch();
                    if (activeTarget) loadReptilesByTarget(activeTarget);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Add a summary card showing current active target */}
      <Card className="mb-4 bg-muted/20">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-sm font-medium">Current Target:</span>{' '}
              <Badge variant="outline">
                {activeTarget?.target_type === 'room' && activeTarget.room_name && (
                  <>Room: {activeTarget.room_name}</>
                )}
                {activeTarget?.target_type === 'rack' && activeTarget.rack_name && (
                  <>Rack: {activeTarget.rack_name}</>
                )}
                {activeTarget?.target_type === 'level' && activeTarget.rack_name && (
                  <>Level: {activeTarget.rack_name} - {activeTarget.level_number}</>
                )}
                {activeTarget?.target_type === 'location' && activeTarget.location_label && (
                  <>Location: {activeTarget.location_label}</>
                )}
                {activeTarget?.target_type === 'reptile' && activeTarget.reptile_name && (
                  <>Reptile: {activeTarget.reptile_name}</>
                )}
                {!activeTarget && <>None selected</>}
              </Badge>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {activeTarget ? "1 location" : "0 locations"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Turtle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {reptilesByLocation.length} reptile{reptilesByLocation.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedDates.map(date => (
        <Card key={date} className="overflow-hidden border shadow-sm">
          <CardHeader className="py-3 px-4 md:px-6 bg-muted/50">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                {isToday(new Date(date)) && (
                  <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900 dark:text-blue-300">
                    Today
                  </Badge>
                )}
              </span>
              {eventsByDate[date].some(e => 'virtual' in e) && (
                <Badge variant="outline" className="text-xs">
                  Virtual Events
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] py-3 text-center">Fed</TableHead>
                    <TableHead className="w-[160px] py-3">Reptile</TableHead>
                    <TableHead className="w-[120px] py-3">Morph</TableHead>
                    <TableHead className="w-[120px] py-3">Species</TableHead>
                    <TableHead className="w-[300px] py-3">Notes</TableHead>
                    <TableHead className="w-[70px] py-3 text-right">Save</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedReptiles(eventsByDate[date]).map((event, index) => {
                    // Check if this is a virtual event
                    const isVirtual = 'virtual' in event;
                    
                    if (isVirtual) {
                      const virtualEvent = event as VirtualFeedingEvent;
                      return (
                        <TableRow key={`virtual-${virtualEvent.reptile_id}-${date}-${index}`} className="bg-amber-50/30 dark:bg-amber-950/20">
                          <TableCell className="text-center py-3">
                            <div className="flex justify-center">
                              <Checkbox 
                                checked={false}
                                disabled={creatingVirtualEvent}
                                onCheckedChange={(checked) => 
                                  createRealEventFromVirtual(virtualEvent, !!checked)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="font-medium">
                              {virtualEvent.reptile_name}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">{virtualEvent.morph_name}</TableCell>
                          <TableCell className="py-3">{virtualEvent.species_name}</TableCell>
                          <TableCell className="py-3">
                            <div className="text-sm text-muted-foreground italic">
                              This is a virtual event based on your schedule. Check the box to record this feeding.
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              disabled={creatingVirtualEvent}
                              onClick={() => createRealEventFromVirtual(virtualEvent)}
                            >
                              {creatingVirtualEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    // Real event handling
                    const realEvent = event as FeedingEventWithDetails;
                    return (
                      <TableRow key={realEvent.id} className={realEvent.fed ? "bg-muted/30" : ""}>
                        <TableCell className="text-center py-3">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={realEvent.fed}
                              disabled={updatingEventId === realEvent.id}
                              onCheckedChange={(checked) => 
                                handleUpdateEvent(realEvent.id, !!checked)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="font-medium">
                            {realEvent.reptile_name}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">{realEvent.morph_name}</TableCell>
                        <TableCell className="py-3">{realEvent.species_name}</TableCell>
                        <TableCell className="py-3">
                          <Textarea 
                            placeholder="Add notes (optional)"
                            value={eventNotes[realEvent.id] || ''}
                            onChange={(e) => handleNotesChange(realEvent.id, e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            disabled={updatingEventId === realEvent.id}
                            onClick={() => handleSaveNotes(realEvent.id)}
                          >
                            {updatingEventId === realEvent.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-2 px-4 border-t">
            <div className="text-xs text-muted-foreground w-full text-right">
              {eventsByDate[date].length} reptile{eventsByDate[date].length !== 1 ? 's' : ''}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 