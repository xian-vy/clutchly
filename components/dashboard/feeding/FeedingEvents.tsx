'use client';

import { createFeedingEvent, getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, Check, ChevronDown, ChevronRight, Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FeedingEventsList from './FeedingEventsList';
import { shouldHaveFeedingToday } from './utils';

interface FeedingEventsListProps {
  scheduleId: string;
  schedule: FeedingScheduleWithTargets;
  onEventsUpdated?: () => void;
  isNewSchedule : boolean
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

export function FeedingEvents({ scheduleId, schedule, onEventsUpdated,isNewSchedule }: FeedingEventsListProps) {
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  const [reptilesByLocation, setReptilesByLocation] = useState<Reptile[]>([]);
  const [isLoadingReptiles, setIsLoadingReptiles] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<FeedingTargetWithDetails | null>(null);
  const [sortBy, setSortBy] = useState<'species' | 'name' | 'morph' | 'all'>('all');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [feedingAll, setFeedingAll] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const {morphs} = useMorphsStore()
  const {species} = useSpeciesStore()
  
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
    staleTime: 3000000, // 30 seconds
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
        // For reptile targets, we need to fetch all reptile targets from the schedule
        const reptileTargets = schedule.targets.filter(t => t.target_type === 'reptile');
        console.log(`Found ${reptileTargets.length} reptile targets in schedule`);
        
        if (reptileTargets.length === 0) {
          console.log("No reptile targets found in schedule");
          setReptilesByLocation([]);
          return;
        }
        
        try {
          // Fetch all reptiles in parallel
          const reptilePromises = reptileTargets.map(t => getReptileById(t.target_id));
          const reptiles = await Promise.all(reptilePromises);
          console.log(`Loaded ${reptiles.length} reptiles:`, reptiles);
          setReptilesByLocation(reptiles);
        } catch (error) {
          console.error('Error fetching reptiles:', error);
          toast.error(`Failed to fetch reptiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        } catch (error : unknown) {
          console.error(`Error fetching reptiles by ${target.target_type}:`, error);
          toast.error(`Failed to fetch reptiles by ${target.target_type}: ${error instanceof Error ?  error.message : 'Unknown error'}`);
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

// Determine if feeding should happen today based on schedul

// Generate virtual events based on schedule
const { data: virtualEvents = [] } = useQuery({
  queryKey: ['virtual-feeding-events', scheduleId, activeTarget?.id],
  queryFn: async () => {
    if (!activeTarget || isLoadingReptiles || reptilesByLocation.length === 0) {
      console.log('Skipping virtual events generation:', { activeTarget, isLoadingReptiles, reptileCount: reptilesByLocation.length });
      return [];
    }

    const today = startOfDay(new Date());
    const virtualEvents: VirtualFeedingEvent[] = [];
    
    // Check if we should show feeding events today based on schedule
    const shouldShowEvents = shouldHaveFeedingToday(schedule);
    console.log('Should show feeding events today:', shouldShowEvents, {
      recurrence: schedule.recurrence,
      custom_days: schedule.custom_days,
      today: today.getDay(),
      startDate: schedule.start_date
    });
    
    if (shouldShowEvents) {
      const todayString = format(today, 'yyyy-MM-dd');
      const todayEvents = events.filter(e => e.scheduled_date === todayString);
      
      // Create virtual events for each reptile that doesn't have an event
      for (const reptile of reptilesByLocation) {
        const hasExistingEvent = todayEvents.some(e => e.reptile_id === reptile.id);
        console.log(`Processing reptile ${reptile.name}:`, { 
          hasExistingEvent,
          reptileId: reptile.id,
          speciesId: reptile.species_id,
          morphId: reptile.morph_id
        });
        
        if (!hasExistingEvent) {
          virtualEvents.push({
            virtual: true,
            reptile_id: reptile.id,
            scheduled_date: todayString,
            reptile_name: reptile.name,
            species_name: species.find(s => s.id.toString() === reptile.species_id.toString())?.name || 'Unknown Species',
            morph_name: morphs.find(m => m.id.toString() === reptile.morph_id.toString())?.name || 'Unknown Species',
          });
        }
      }
    }
    
    console.log('Generated virtual events:', virtualEvents);
    return virtualEvents;
  },
  enabled: !!activeTarget && !isLoadingReptiles && reptilesByLocation.length > 0,
  staleTime: 600000, // 1 minute
});

const handleNotesChange = (eventId: string, notes: string) => {
  setEventNotes(currentNotes => ({
    ...currentNotes,
    [eventId]: notes
  }));
};
  // Convert a virtual event to a real event
  
  
  // Update a feeding event (mark as fed/unfed)
  const handleUpdateEvent = async (eventId: string, fed: boolean) => {
    setUpdatingEventId(eventId);
    try {
      const notes = eventNotes[eventId];
      
      // Optimistic update - update the cache immediately before the API call
      const currentEvents = queryClient.getQueryData<FeedingEventWithDetails[]>(['feeding-events', scheduleId]) || [];
      const eventToUpdate = currentEvents.find(e => e.id === eventId);
      
      if (eventToUpdate) {
        queryClient.setQueryData(['feeding-events', scheduleId], 
          currentEvents.map(event => 
            event.id === eventId 
              ? { ...event, fed, notes: notes || null } 
              : event
          )
        );
      }
      
      // Make the API call
      const updatedEvent = await updateFeedingEvent(eventId, {
        fed,
        notes: notes || null
      });
      
      // Update the cache with the server response
      queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
        if (!oldData) return [updatedEvent];
        return oldData.map(event => event.id === eventId ? { ...event, ...updatedEvent } : event);
      });
      
      // Only invalidate the feeding status query, not the events query
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
      
      toast.success(`Feeding ${fed ? 'completed' : 'unmarked'}`);
      
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error updating feeding event:', error);
      toast.error('Failed to update feeding status');
      
      // Revert the optimistic update if the API call failed
      refetch();
    } finally {
      setUpdatingEventId(null);
    }
  };
  
  // Save notes for an event
 

  // Group events by date
  const eventsByDate: Record<string, (FeedingEventWithDetails | VirtualFeedingEvent)[]> = {};

  // First add real events
  events.forEach(event => {
    const date = event.scheduled_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });

  // Then add virtual events, but only if there's no real event for that reptile on that date
  virtualEvents.forEach(virtualEvent => {
    const date = virtualEvent.scheduled_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    
    // Check if there's already a real event for this reptile on this date
    const hasRealEvent = events.some(event => 
      event.reptile_id === virtualEvent.reptile_id && 
      event.scheduled_date === virtualEvent.scheduled_date
    );
    
    // Only add the virtual event if there's no real event for this reptile
    if (!hasRealEvent) {
      eventsByDate[date].push(virtualEvent);
    }
  });
  
  // Sort dates
  const sortedDates = Object.keys(eventsByDate)
  .filter(date => {
    // Always show today's date
    if (isToday(new Date(date))) return true;
    
    // For past dates, check if any events are not fed
    const dateEvents = eventsByDate[date];
    const hasUnfedEvents = dateEvents.some(event => {
      if ('virtual' in event) return true; // Virtual events are always unfed
      return !event.fed; // Check real events
    });
    
    return hasUnfedEvents;
  })
  .sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()  // Newest dates first
  );
  
  // Initialize expandedDates with the latest date expanded
  useEffect(() => {
    if (sortedDates.length > 0 && Object.keys(expandedDates).length === 0) {
      setExpandedDates({ [sortedDates[0]]: true });
    }
  }, [sortedDates, expandedDates]);

  // Function to feed all reptiles for a specific date
  const handleFeedAll = async (date: string) => {
    setFeedingAll(true);
    try {
      const dateEvents = eventsByDate[date];
      const unfedEvents = dateEvents.filter(event => {
        if ('virtual' in event) {
          return true; // All virtual events need to be fed
        } else {
          return !event.fed; // Only unfed real events
        }
      });

      // Make a copy of the events for optimistic updates
      const virtualEventsCopy = [...(queryClient.getQueryData<VirtualFeedingEvent[]>(['virtual-feeding-events', scheduleId, activeTarget?.id]) || [])];
      const realEventsCopy = [...(queryClient.getQueryData<FeedingEventWithDetails[]>(['feeding-events', scheduleId]) || [])];
      
      // Optimistically update the UI
      const updatedRealEvents = [...realEventsCopy];
      
      // Update real events optimistically
      unfedEvents.forEach(event => {
        if (!('virtual' in event)) {
          const index = updatedRealEvents.findIndex(e => e.id === event.id);
          if (index !== -1) {
            updatedRealEvents[index] = { ...updatedRealEvents[index], fed: true };
          }
        }
      });
      
      // Remove virtual events optimistically
      const updatedVirtualEvents = virtualEventsCopy.filter(ve => {
        return !unfedEvents.some(event => 
          'virtual' in event && 
          event.reptile_id === ve.reptile_id && 
          event.scheduled_date === ve.scheduled_date
        );
      });
      
      // Update the cache optimistically
      queryClient.setQueryData(['feeding-events', scheduleId], updatedRealEvents);
      queryClient.setQueryData(['virtual-feeding-events', scheduleId, activeTarget?.id], updatedVirtualEvents);

      // Process each unfed event
      for (const event of unfedEvents) {
        if ('virtual' in event) {
          // Handle virtual event
          const virtualEvent = event as VirtualFeedingEvent;
          const notes = eventNotes[`virtual-${virtualEvent.reptile_id}`] || '';
          
          // Don't use createRealEventFromVirtual here as we've already done the optimistic update
          await createFeedingEvent({
            schedule_id: scheduleId,
            reptile_id: virtualEvent.reptile_id,
            scheduled_date: virtualEvent.scheduled_date,
            fed: true,
            fed_at: new Date().toISOString(),
            notes: notes || null
          });
        } else {
          // Handle real event
          const realEvent = event as FeedingEventWithDetails;
          const notes = eventNotes[realEvent.id] || '';
          await updateFeedingEvent(realEvent.id, {
            fed: true,
            notes: notes || null
          });
        }
      }

      // Only invalidate the feeding status query
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });

      toast.success('All reptiles fed successfully');
      
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error feeding all reptiles:', error);
      toast.error('Failed to feed all reptiles');
      
      // Revert optimistic updates if there was an error
      refetch();
      queryClient.invalidateQueries({ queryKey: ['virtual-feeding-events', scheduleId, activeTarget?.id] });
    } finally {
      setFeedingAll(false);
    }
  };
  
  if (isLoading || isLoadingReptiles || feedingAll) {
    return (
      <Card className="min-h-[200px] border-0 shadow-none">
        <CardContent className="flex justify-center items-center h-full py-10">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Show all events regardless of target type
  console.log("All events:", events.length, events);
  
  // Combine real and virtual events
  const allEvents = [...events, ...virtualEvents];
  console.log("All events after combining with virtual:", allEvents.length, allEvents);
  
  if (schedule.targets.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No feeding targets defined</AlertTitle>
        <AlertDescription>
          This schedule doesnt have any targets defined. Add rooms, racks, levels, or specific locations to this schedule.
        </AlertDescription>
      </Alert>
    );
  }

  if (isNewSchedule) return;

  if (allEvents.length === 0 && reptilesByLocation.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
            <div className="text-muted-foreground font-medium mb-2">No reptiles found</div>
            <div className="text-sm text-muted-foreground mb-4">
              No reptiles are assigned to this feeding schedule.
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
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
            <div className="text-muted-foreground font-medium mb-2">No feeding events yet</div>
            <div className="text-sm text-muted-foreground mb-4">
              Found {reptilesByLocation.length} reptile{reptilesByLocation.length !== 1 ? 's' : ''}, but no feeding events have been generated yet.
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
  
  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <Card key={date} className="overflow-hidden border-x-0 border-b-0 border-t rounded-none shadow-none mb-5 pt-0 gap-0">
          <CardHeader className="py-3 px-4 ">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }))}
                >
                  {expandedDates[date] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <span className='flex flex-col items-start gap-1'>
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  {isToday(new Date(date)) && (
                    <small className='text-muted-foreground'>
                      Today
                    </small>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as 'species' | 'name' | 'morph' | 'all')}
                >
                  <SelectTrigger className="w-[120px] !h-8 text-xs">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                   <SelectItem value="all">Sort By</SelectItem>
                    <SelectItem value="name">Reptile Name</SelectItem>
                    <SelectItem value="species">Species</SelectItem>
                    <SelectItem value="morph">Morph</SelectItem>
                  </SelectContent>
                </Select>
                {expandedDates[date] && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs"
                    onClick={() => handleFeedAll(date)}
                    disabled={feedingAll}
                  >
                    {feedingAll ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Feeding All...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Feed All
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          {expandedDates[date] && (
          <FeedingEventsList
              date={date}
              eventsByDate={eventsByDate}
              events={events}
              sortBy={sortBy}
              schedule={schedule}
              queryClient={queryClient}
              activeTarget={activeTarget}
              onEventsUpdated={onEventsUpdated}
              eventNotes={eventNotes}
              updatingEventId={updatingEventId}
              handleNotesChange={handleNotesChange}
              handleUpdateEvent={handleUpdateEvent}
          />
          )}
        </Card>
      ))}
    </div>
  );
}