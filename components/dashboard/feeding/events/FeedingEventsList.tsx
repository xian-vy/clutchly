'use client';

import { getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { FeedingEventWithDetails } from '@/lib/types/feeding';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, PlusCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FeedingEventsListProps {
  scheduleId: string;
  date?: string;
  onStatusChange?: () => void;
}

export function FeedingEventsList({ scheduleId, date, onStatusChange }: FeedingEventsListProps) {
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
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
      
      // Call the onStatusChange callback to refresh the parent component
      if (onStatusChange) {
        onStatusChange();
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
      
      // Call the onStatusChange callback
      if (onStatusChange) {
        onStatusChange();
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
  
  if (events.length === 0) {
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
  
  // Filter events by date if date is provided
  const filteredEvents = date
    ? events.filter(event => event.scheduled_date === date)
    : events;
  
  // Group events by date
  const eventsByDate: Record<string, FeedingEventWithDetails[]> = {};
  filteredEvents.forEach(event => {
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
            <CardTitle className="text-sm font-medium">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
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
                  {eventsByDate[date].map(event => (
                    <TableRow key={event.id} className={event.fed ? "bg-muted/30" : ""}>
                      <TableCell className="text-center py-3">
                        <div className="flex justify-center">
                          <Checkbox 
                            checked={event.fed}
                            disabled={updatingEventId === event.id}
                            onCheckedChange={(checked) => 
                              handleUpdateEvent(event.id, !!checked)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium py-3">{event.reptile_name}</TableCell>
                      <TableCell className="py-3">{event.morph_name}</TableCell>
                      <TableCell className="py-3">{event.species_name}</TableCell>
                      <TableCell className="py-3">
                        <Textarea 
                          value={eventNotes[event.id] || ''}
                          onChange={(e) => handleNotesChange(event.id, e.target.value)}
                          placeholder="Add feeding notes..."
                          className="h-[60px] resize-none min-h-0"
                        />
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingEventId === event.id}
                          onClick={() => handleSaveNotes(event.id)}
                          className="h-8 w-8 p-0"
                        >
                          {updatingEventId === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span className="sr-only">Save</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 