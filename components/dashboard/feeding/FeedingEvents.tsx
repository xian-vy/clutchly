'use client';

import {  createFeedingEventsForToday, getFeedingEvents } from '@/app/api/feeding/events';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import { AlertCircle, ChevronDown, ChevronRight, Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FeedingEventsList from './FeedingEventsList';
import { saveMultipleEvents, shouldHaveFeedingToday, updateFeedingEventWithCache } from './utils';
import { FeedingEventFilters } from './FeedingEventFilters';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

export interface ScheduleStatus {
  totalEvents: number;
  completedEvents: number;
  isComplete: boolean;
  percentage: number;
  scheduledDate: string;
}

interface FeedingEventsListProps {
  scheduleId: string;
  schedule: FeedingScheduleWithTargets;
  onEventsUpdated?: () => void;
  isNewSchedule: boolean;
}

export function FeedingEvents({ scheduleId, schedule, onEventsUpdated, isNewSchedule }: FeedingEventsListProps) {
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  const [feederTypeSize, setFeederTypeSize] = useState<Record<string, string>>({});
  const [reptilesByLocation, setReptilesByLocation] = useState<Reptile[]>([]);
  const [isLoadingReptiles, setIsLoadingReptiles] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<FeedingTargetWithDetails | null>(null);
  const [sortBy, setSortBy] = useState<'species' | 'name' | 'morph' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [feedingAll, setFeedingAll] = useState<boolean>(false);
  const [creatingEvents, setCreatingEvents] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { 
    data: events = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: [CACHE_KEYS.FEEDING_EVENTS, scheduleId],
    queryFn: () => getFeedingEvents(scheduleId),
    staleTime: 30000 * 60, 
    refetchOnMount: false,
    refetchOnWindowFocus: false 
  });

  useEffect(() => {
    if (events.length > 0) {
      const notesMap: Record<string, string> = {};
      const feederTypeSizeMap: Record<string, string> = {};
      events.forEach(event => {
        notesMap[event.id] = event.notes || '';
        feederTypeSizeMap[event.id] = event.feeder_size_id || '';
      });
      setEventNotes(notesMap);
      setFeederTypeSize(feederTypeSizeMap);
    }
  }, [events]);

  // Load reptiles for the first target when component mounts
  useEffect(() => {
    if (schedule?.targets?.length > 0 && !activeTarget) {
      const firstTarget = schedule.targets[0];
      setActiveTarget(firstTarget);
    }
  }, [schedule, activeTarget]);

  // Load reptiles when activeTarget changes
  useEffect(() => {
    if (activeTarget) {
      loadReptilesByTarget(activeTarget);
    }
  }, [activeTarget]);

  // Generate events for today if needed
  useEffect(() => {
    if (reptilesByLocation.length > 0 && shouldHaveFeedingToday(schedule) && !isNewSchedule) {
      createEventsForToday();
    }
  }, [reptilesByLocation, schedule, isNewSchedule]);

  // Function to create events for today's feeding
  const createEventsForToday = async () => {
    if (creatingEvents || isNewSchedule) return;
    
    setCreatingEvents(true);
    try {
      const reptileIds = reptilesByLocation.map(reptile => reptile.id);
      
      if (reptileIds.length > 0) {
        const result = await createFeedingEventsForToday(scheduleId, reptileIds);
        
        if (result.created > 0) {
          toast.success(`Created ${result.created} new feeding events for today`);
          refetch();
        }
      }
    } catch (error) {
      console.error('Error creating feeding events for today:', error);
      toast.error('Failed to create feeding events');
    } finally {
      setCreatingEvents(false);
    }
  };


  // Function to load reptiles based on target
  const loadReptilesByTarget = async (target: FeedingTargetWithDetails) => {
    setIsLoadingReptiles(true);
    setReptilesByLocation([]); // Clear previous reptiles while loading
    
    try {
      // If target type is 'reptile', handle it directly
      if (target.target_type === 'reptile') {
        // For reptile targets, we need to fetch all reptile targets from the schedule
        const reptileTargets = schedule.targets.filter(t => t.target_type === 'reptile');
        
        if (reptileTargets.length === 0) {
          setReptilesByLocation([]);
          return;
        }
        
        try {
          // Fetch all reptiles in parallel
          const reptilePromises = reptileTargets.map(t => getReptileById(t.target_id));
          const reptiles = await Promise.all(reptilePromises);
          setReptilesByLocation(reptiles);
        } catch (error) {
          console.error('Error fetching reptiles:', error);
          toast.error(`Failed to fetch reptiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setReptilesByLocation([]);
        }
      } else {
        // For location-based targets, fetch reptiles for all targets of the same type
        try {
          const sameTypeTargets = schedule.targets.filter(t => t.target_type === target.target_type);
          const reptilePromises = sameTypeTargets.map(t => 
            getReptilesByLocation(
              t.target_type as 'room' | 'rack' | 'level' | 'location',
              t.target_id
            )
          );
          
          const reptileArrays = await Promise.all(reptilePromises);
          // Flatten and remove duplicates based on reptile ID
          const allReptiles = Array.from(
            new Map(
              reptileArrays.flat().map(reptile => [reptile.id, reptile])
            ).values()
          );
          
          setReptilesByLocation(allReptiles || []);
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

  const handleNotesChange = (eventId: string, notes: string) => {
    setEventNotes(currentNotes => ({
      ...currentNotes,
      [eventId]: notes
    }));
  };

  const handleFeederTypeChange = (eventId: string, feederTypeId: string) => {
    setFeederTypeSize(currentFeederTypeSize => ({
      ...currentFeederTypeSize,
      [eventId]: feederTypeId
    }));
  };
  
  // Update a feeding event (mark as fed/unfed)
  const handleUpdateEvent = async (eventId: string, fed: boolean) => {
    setUpdatingEventId(eventId);
    try {
      const notes = eventNotes[eventId];
      const feederSizeId = feederTypeSize[eventId];
      
      await updateFeedingEventWithCache(
        eventId,
        fed,
        notes || null,
        feederSizeId || null,
        scheduleId,
        queryClient,
        onEventsUpdated
      );

      toast.success(`Feeding ${fed ? 'completed' : 'unmarked'}`);
    } catch (error) {
      console.error('Error updating feeding event:', error);
      toast.error('Failed to update feeding status');
    } finally {
      setUpdatingEventId(null);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FEEDING_UPCOMING] });
    }
  };

  // Group events by date
  const eventsByDate: Record<string, FeedingEventWithDetails[]> = {};

  // Filter events based on search query
  const filterEventsBySearch = (events: FeedingEventWithDetails[]) => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.reptile_name.toLowerCase().includes(query) ||
      event.species_name.toLowerCase().includes(query) ||
      (event.morph_name?.toLowerCase() || '').includes(query)
    );
  };

  // Group real events by date
  events.forEach(event => {
    const date = event.scheduled_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });

  // Apply search filter to each date's events
  Object.keys(eventsByDate).forEach(date => {
    eventsByDate[date] = filterEventsBySearch(eventsByDate[date]);
  });
  
  // Sort dates
  const sortedDates = Object.keys(eventsByDate)
  .filter(date => {
    // Always show today's date
    if (isToday(new Date(date))) return true;
    
    // For past dates, check if any events are not fed
    const dateEvents = eventsByDate[date];
    const hasUnfedEvents = dateEvents.some(event => !event.fed);
    
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
      
      // Prepare events data with notes AND feeder type for ALL events
      const eventsToUpdate = dateEvents.map(event => ({
        id: event.id,
        notes: eventNotes[event.id] || null,
        feeder_size_id: feederTypeSize[event.id] || null,
        fed : true 
      }));
      
      // Use the new utility function to save multiple events
      await saveMultipleEvents(eventsToUpdate, true, scheduleId, queryClient, onEventsUpdated);
      
      toast.success('All reptiles fed successfully');
    } catch (error) {
      console.error('Error feeding all reptiles:', error);
      toast.error('Failed to feed all reptiles');
    } finally {
      setFeedingAll(false);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FEEDING_UPCOMING] });
    }
  };

  // Function to set feeder type for all reptiles
  const handleSetFeederForAll = async (date: string, feederSizeId: string) => {
    setFeedingAll(true);
    try {
      const dateEvents = eventsByDate[date];
      
      // Prepare events data with current notes, feeding status, and new feeder type
      const eventsToUpdate = dateEvents.map(event => ({
        id: event.id,
        notes: eventNotes[event.id] || null,
        feeder_size_id: feederSizeId,
        fed: event.fed // Preserve the current feeding status
      }));
      
      // Use the same utility function to save multiple events
      await saveMultipleEvents(eventsToUpdate, false, scheduleId, queryClient, onEventsUpdated);
      
      // Update local state
      const newFeederTypeSize = { ...feederTypeSize };
      dateEvents.forEach(event => {
        newFeederTypeSize[event.id] = feederSizeId;
      });
      setFeederTypeSize(newFeederTypeSize);
      
      toast.success('Feeder type set for all reptiles');
    } catch (error) {
      console.error('Error setting feeder type for all reptiles:', error);
      toast.error('Failed to set feeder type');
    } finally {
      setFeedingAll(false);
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FEEDING_UPCOMING] });
    }
  };

  // Show loading state while any operation is in progress
  if (isLoading || isLoadingReptiles || feedingAll || creatingEvents) {
    return (
      <Card className="min-h-[200px] border-0 shadow-none">
        <CardContent className="flex justify-center items-center h-full py-10">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (schedule.targets.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No feeding targets defined</AlertTitle>
        <AlertDescription>
          This schedule doesn&apos;t have any targets defined. Add rooms, racks, levels, or specific locations to this schedule.
        </AlertDescription>
      </Alert>
    );
  }

  if (isNewSchedule) return null;

  if (events.length === 0 && reptilesByLocation.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
            <div className="text-muted-foreground font-medium mb-2">No reptiles found</div>
            <div className="text-sm text-muted-foreground mb-4">
              No reptiles are assigned to this feeding schedule.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  
  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <Card key={date} className="overflow-hidden border-x-0 border-b-0 border-t rounded-none shadow-none pt-0 gap-0">
          <CardHeader className="py-3 px-2 sm:px-4">
            <CardTitle className="text-sm font-medium flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 w-full">
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
              {expandedDates[date] && (
                <FeedingEventFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onSetFeederForAll={(feederSizeId) => handleSetFeederForAll(date, feederSizeId)}
                  onFeedAll={() => handleFeedAll(date)}
                  feedingAll={feedingAll}
                />
              )}
            </CardTitle>
          </CardHeader>
          {expandedDates[date] && (
            <FeedingEventsList
              date={date}
              eventsByDate={{
                [date]: eventsByDate[date].sort((a, b) => {
                  // Sort by fed status first (unfed before fed)
                  if (a.fed !== b.fed) {
                    return a.fed ? 1 : -1;
                  }
                  // Then apply the selected sort criteria
                  return 0;
                })
              }}
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
              handleFeederTypeChange={handleFeederTypeChange}
              feederTypeSize={feederTypeSize}
            />
          )}
        </Card>
      ))}
    </div>
  );
}