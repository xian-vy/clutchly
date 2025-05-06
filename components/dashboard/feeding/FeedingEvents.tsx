'use client';

import {  createFeedingEventsForToday, getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
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

import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import { AlertCircle, Check, ChevronDown, ChevronRight, Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FeedingEventsList from './FeedingEventsList';
import { saveMultipleEvents, shouldHaveFeedingToday } from './utils';
import { ScheduleStatus } from './FeedingTab';

interface FeedingEventsListProps {
  scheduleId: string;
  schedule: FeedingScheduleWithTargets;
  onEventsUpdated?: () => void;
  isNewSchedule: boolean;
}

export function FeedingEvents({ scheduleId, schedule, onEventsUpdated, isNewSchedule }: FeedingEventsListProps) {
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  const [reptilesByLocation, setReptilesByLocation] = useState<Reptile[]>([]);
  const [isLoadingReptiles, setIsLoadingReptiles] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<FeedingTargetWithDetails | null>(null);
  const [sortBy, setSortBy] = useState<'species' | 'name' | 'morph' | 'all'>('all');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [feedingAll, setFeedingAll] = useState<boolean>(false);
  const [creatingEvents, setCreatingEvents] = useState<boolean>(false);
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

  // Add a retry button functionality
  // const handleRetryLoadReptiles = () => {
  //   if (activeTarget) {
  //     loadReptilesByTarget(activeTarget);
  //   }
  // };

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
  
  // Update a feeding event (mark as fed/unfed)
  const handleUpdateEvent = async (eventId: string, fed: boolean) => {
    setUpdatingEventId(eventId);
    try {
      const notes = eventNotes[eventId];
      const currentEvents = queryClient.getQueryData<FeedingEventWithDetails[]>(['feeding-events', scheduleId]) || [];
      const eventToUpdate = currentEvents.find(e => e.id === eventId);
      
      if (eventToUpdate) {
        // Optimistically update events cache
        queryClient.setQueryData(['feeding-events', scheduleId], 
          currentEvents.map(event => 
            event.id === eventId 
              ? { ...event, fed, fed_at: fed ? new Date().toISOString() : null, notes: notes || null } 
              : event
          )
        );
        
        // Optimistically update feeding status cache
        queryClient.setQueryData(['feeding-status'], (oldData: Record<string, ScheduleStatus> | undefined) => {
          if (!oldData || !oldData[scheduleId]) return oldData;
          const statusChange = eventToUpdate.fed !== fed ? 1 : 0;
          return {
            ...oldData,
            [scheduleId]: {
              ...oldData[scheduleId],
              completedEvents: oldData[scheduleId].completedEvents + (fed ? statusChange : -statusChange),
              percentage: Math.round(((oldData[scheduleId].completedEvents + (fed ? statusChange : -statusChange)) / oldData[scheduleId].totalEvents) * 100)
            }
          };
        });
      }
      
      // Make the API call
      const updatedEvent = await updateFeedingEvent(eventId, {
        fed,
        fed_at: fed ? new Date().toISOString() : null,
        notes: notes || null
      });

        // Update cache with server response
        queryClient.setQueryData(['feeding-events', scheduleId], 
          currentEvents.map(event => 
            event.id === eventId ? { ...event, ...updatedEvent } : event
          )
        );
 
      
      toast.success(`Feeding ${fed ? 'completed' : 'unmarked'}`);
      
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error updating feeding event:', error);
      toast.error('Failed to update feeding status');
      
      // Revert both caches on error
      queryClient.invalidateQueries({ queryKey: ['feeding-events', scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    } finally {
      setUpdatingEventId(null);
    }
  };

  // Group events by date
  const eventsByDate: Record<string, FeedingEventWithDetails[]> = {};

  // Group real events by date
  events.forEach(event => {
    const date = event.scheduled_date;
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
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
      const unfedEvents = dateEvents.filter(event => !event.fed);
      
      if (unfedEvents.length === 0) {
        toast.info('All reptiles are already fed');
        return;
      }
      
      // Prepare events data with notes
      const eventsToUpdate = unfedEvents.map(event => ({
        id: event.id,
        notes: eventNotes[event.id] || null
      }));
      
      // Use the new utility function to save multiple events
      await saveMultipleEvents(eventsToUpdate, true, scheduleId, queryClient, onEventsUpdated);
      
      toast.success('All reptiles fed successfully');
    } catch (error) {
      console.error('Error feeding all reptiles:', error);
      toast.error('Failed to feed all reptiles');
    } finally {
      setFeedingAll(false);
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

  if (events.length === 0 && reptilesByLocation.length > 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
            <div className="text-muted-foreground font-medium mb-2">No feeding events yet</div>
            <div className="text-sm text-muted-foreground mb-4">
              Found {reptilesByLocation.length} reptile{reptilesByLocation.length !== 1 ? 's' : ''}, but no feeding events have been generated yet.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <Card key={date} className="overflow-hidden border-x-0 border-b-0 border-t rounded-none shadow-none  pt-0 gap-0">
          <CardHeader className="py-3 px-2 sm:px:4 ">
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
                  <SelectTrigger className="w-[120px] !h-8 !text-xs dark:!border-0 hidden sm:flex">
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
                    variant="default" 
                    className="h-7 sm:h-8 text-xs"
                    onClick={() => handleFeedAll(date)}
                    disabled={feedingAll}
                  >
                    {feedingAll ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        Feeding All...
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
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
          />
          )}
        </Card>
      ))}
    </div>
  );
}