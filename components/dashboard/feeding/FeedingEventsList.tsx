'use client';

import { FeedingEventWithDetails, FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { createFeedingEvent, getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format, addDays, isBefore, isSameDay, startOfDay, isToday } from 'date-fns';
import { CheckCircle2, Loader2, PlusCircle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
  
  // Generate virtual events based on schedule
  const { data: virtualEvents = [] } = useQuery({
    queryKey: ['virtual-feeding-events', scheduleId],
    queryFn: async () => {
      // Get reptile IDs from the actual events to know which reptiles are part of this schedule
      const reptileInfo: { [key: string]: { name: string, species_name: string, morph_name: string } } = {};
      events.forEach(event => {
        reptileInfo[event.reptile_id] = {
          name: event.reptile_name,
          species_name: event.species_name,
          morph_name: event.morph_name
        };
      });
      
      if (Object.keys(reptileInfo).length === 0) {
        return []; // No reptile info yet
      }

      const today = startOfDay(new Date());
      const virtualEvents: VirtualFeedingEvent[] = [];
      
      // If no events for today exist yet, create virtual ones
      const todayString = format(today, 'yyyy-MM-dd');
      const hasEventsForToday = events.some(e => e.scheduled_date === todayString);
      
      // Create virtual events based on schedule
      if (!hasEventsForToday) {
        const shouldFeedToday = shouldHaveFeedingToday(schedule);
        
        if (shouldFeedToday) {
          // Create virtual events for each reptile
          Object.entries(reptileInfo).forEach(([reptileId, info]) => {
            virtualEvents.push({
              virtual: true,
              reptile_id: reptileId,
              scheduled_date: todayString,
              reptile_name: info.name,
              species_name: info.species_name,
              morph_name: info.morph_name
            });
          });
        }
      }
      
      return virtualEvents;
    },
    enabled: events.length > 0,
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
  
  if (isLoading) {
    return (
      <Card className="min-h-[200px] border-0 shadow-none">
        <CardContent className="flex justify-center items-center h-full py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Combine real and virtual events
  const allEvents = [...events, ...virtualEvents];
  
  if (allEvents.length === 0) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center justify-center text-center py-12">
          <PlusCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-70" />
          <div className="text-muted-foreground font-medium mb-2">No feeding events found</div>
          <div className="text-sm text-muted-foreground">
            Use the "Generate Events" button to create feeding events based on this schedule.
          </div>
        </CardContent>
      </Card>
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
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  return (
    <div className="space-y-6">
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
                  {eventsByDate[date].map((event, index) => {
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
        </Card>
      ))}
    </div>
  );
} 