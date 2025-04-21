'use client';

import { createFeedingEvent, getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
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
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, Loader2, PlusCircle, RefreshCw, Save, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
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

// Determine if feeding should happen today based on schedule
const shouldHaveFeedingToday = (schedule: FeedingScheduleWithTargets): boolean => {
  const today = new Date();
  const startDate = new Date(schedule.start_date);
  const endDate = schedule.end_date ? new Date(schedule.end_date) : null;
  
  // Set all dates to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(0, 0, 0, 0);
  
  // Basic date range check
  if (today < startDate || (endDate && today > endDate)) {
    return false;
  }

  switch (schedule.recurrence) {
    case 'daily':
      return true;

    case 'weekly': {
      // Get days since start
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      // If it's divisible by 7, it's a feeding day
      return daysSinceStart % 7 === 0;
    }

    case 'custom':
      if (!schedule.custom_days || schedule.custom_days.length === 0) return false;
      
      // Check if today's day of week is in the custom days array
      const todayDayOfWeek = today.getDay();
      if (!schedule.custom_days.includes(todayDayOfWeek)) {
        return false;
      }
      
      // For custom days, we need to check if this is a valid occurrence based on the start date
      // Calculate the first occurrence of each custom day after the start date
      const firstOccurrences = schedule.custom_days.map(day => {
        // Find the first occurrence of this day after the start date
        const firstDate = new Date(startDate);
        const daysToAdd = (day - firstDate.getDay() + 7) % 7;
        firstDate.setDate(firstDate.getDate() + daysToAdd);
        return firstDate;
      });
      
      // Sort the first occurrences by date
      firstOccurrences.sort((a, b) => a.getTime() - b.getTime());
      
      // If today is before the first occurrence of any custom day, return false
      if (today < firstOccurrences[0]) {
        return false;
      }
      
      // For each custom day, calculate all occurrences up to today
      // and check if today is one of them
      for (const day of schedule.custom_days) {
        // Find the first occurrence of this day after the start date
        const firstDate = new Date(startDate);
        const daysToAdd = (day - firstDate.getDay() + 7) % 7;
        firstDate.setDate(firstDate.getDate() + daysToAdd);
        
        // If today is the first occurrence, return true
        if (firstDate.getTime() === today.getTime()) {
          return true;
        }
        
        // If today is after the first occurrence, check if it's a multiple of 7 days from the first occurrence
        if (today > firstDate) {
          const daysSinceFirst = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceFirst % 7 === 0) {
            return true;
          }
        }
      }
      
      return false;

    default:
      return false;
  }
};

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


  // Convert a virtual event to a real event
  const createRealEventFromVirtual = async (virtualEvent: VirtualFeedingEvent, fed: boolean = true, notes: string = '') => {
    setCreatingVirtualEvent(true);
    try {
      const newEvent = await createFeedingEvent({
        schedule_id: scheduleId,
        reptile_id: virtualEvent.reptile_id,
        scheduled_date: virtualEvent.scheduled_date,
        fed,
        fed_at: fed ? new Date().toISOString() : null,
        notes: notes || null
      });
      
      toast.success("Feeding recorded");
      
      // Update the cache with the new event
      queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
        if (!oldData) return [newEvent];
        return [...oldData, newEvent];
      });
      
      // Force invalidate the virtual events query to remove the virtual event
      queryClient.invalidateQueries({ queryKey: ['virtual-feeding-events', scheduleId, activeTarget?.id] });
      
      // Invalidate other queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feeding-status'] })
      ]);
      
      if (onEventsUpdated) {
        onEventsUpdated();
      }
    } catch (error) {
      console.error('Error creating real event from virtual:', error);
      toast.error("Failed to record feeding");
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
      
      // Get the current event to preserve its fed status
      const currentEvent = events.find(e => e.id === eventId);
      if (!currentEvent) {
        throw new Error('Event not found');
      }
      
      const updatedEvent = await updateFeedingEvent(eventId, {
        notes: notes || null,
        fed: currentEvent.fed // Preserve the current fed status
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
        return (a.reptile_name || '').localeCompare(b.reptile_name || '');
      } else if (sortBy === 'species') {
        return (a.species_name || '').localeCompare(b.species_name || '');
      } else {
        return (a.morph_name || '').localeCompare(b.morph_name || '');
      }
    });
  };

  if (isLoading || isLoadingReptiles) {
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
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()  // Newest dates first
  );
  
  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <Card key={date} className="overflow-hidden border-x-0 border-b-0 border-t rounded-none shadow-none mb-5 pt-0 gap-0">
          <CardHeader className="py-3 px-4 md:px-6">
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
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900 dark:text-blue-300">
                      Today
                    </Badge>
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <Select 
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as 'species' | 'name' | 'morph')}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Reptile Name</SelectItem>
                    <SelectItem value="species">Species</SelectItem>
                    <SelectItem value="morph">Morph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          {expandedDates[date] && (
            <div>
              <CardContent className="py-0 px-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[60px] py-3 text-center">Fed</TableHead>
                        <TableHead className="w-[160px] py-3">Reptile</TableHead>
                        <TableHead className="w-[120px] py-3">Morph</TableHead>
                        <TableHead className="w-[120px] py-3">Species</TableHead>
                        <TableHead className="w-[300px] py-3">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedReptiles(eventsByDate[date]).map((event, index) => {
                        // Check if this is a virtual event
                        const isVirtual = 'virtual' in event;
                        
                        if (isVirtual) {
                          const virtualEvent = event as VirtualFeedingEvent;
                          return (
                            <TableRow key={`virtual-${virtualEvent.reptile_id}-${date}-${index}`}>
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
                                <div className="font-normal">
                                  {virtualEvent.reptile_name}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">{virtualEvent.morph_name}</TableCell>
                              <TableCell className="py-3">{virtualEvent.species_name}</TableCell>
                              <TableCell className="py-3">
                                <Textarea 
                                  placeholder="Add notes (optional)"
                                  value={eventNotes[`virtual-${virtualEvent.reptile_id}`] || ''}
                                  onChange={(e) => handleNotesChange(`virtual-${virtualEvent.reptile_id}`, e.target.value)}
                                  className="min-h-[30px] text-xs"
                                />
                              </TableCell>
                              <TableCell className="py-3 text-right">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  disabled={creatingVirtualEvent}
                                  onClick={() => {
                                    // When creating a real event from virtual, include the notes
                                    const notes = eventNotes[`virtual-${virtualEvent.reptile_id}`] || '';
                                    createRealEventFromVirtual(virtualEvent, true, notes);
                                  }}
                                >
                                  {creatingVirtualEvent ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
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
                              <div className="font-normal">
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
                                className="min-h-[30px] text-xs"
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
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}