'use client';

import { FeedingEventWithDetails } from '@/lib/types/feeding';
import { getFeedingEvents, updateFeedingEvent } from '@/app/api/feeding/events';
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
import { format } from 'date-fns';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedingEventsListProps {
  scheduleId: string;
}

export function FeedingEventsList({ scheduleId }: FeedingEventsListProps) {
  const [events, setEvents] = useState<FeedingEventWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  
  // Fetch feeding events for this schedule
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const eventsData = await getFeedingEvents(scheduleId);
      setEvents(eventsData);
      
      // Initialize notes for each event
      const notesMap: Record<string, string> = {};
      eventsData.forEach(event => {
        notesMap[event.id] = event.notes || '';
      });
      setEventNotes(notesMap);
    } catch (error) {
      console.error('Error fetching feeding events:', error);
      toast.error('Failed to load feeding events');
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId]);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Update a feeding event (mark as fed/unfed)
  const handleUpdateEvent = async (eventId: string, fed: boolean) => {
    setUpdatingEventId(eventId);
    try {
      const notes = eventNotes[eventId];
      const updatedEvent = await updateFeedingEvent(eventId, {
        fed,
        notes: notes || null
      });
      
      // Update the events array
      setEvents(currentEvents => 
        currentEvents.map(event => 
          event.id === eventId ? { ...event, ...updatedEvent } : event
        )
      );
      
      toast.success(`Feeding ${fed ? 'completed' : 'unmarked'}`);
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
      
      // Update the events array
      setEvents(currentEvents => 
        currentEvents.map(event => 
          event.id === eventId ? { ...event, ...updatedEvent } : event
        )
      );
      
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setUpdatingEventId(null);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="min-h-[200px]">
        <CardContent className="flex justify-center items-center h-full py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center text-center py-16">
          <div className="text-muted-foreground mb-2">No feeding events found for this schedule.</div>
          <div className="text-sm text-muted-foreground">
            Use the "Generate Events" button to create feeding events based on this schedule.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Group events by date
  const eventsByDate: Record<string, FeedingEventWithDetails[]> = {};
  events.forEach(event => {
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
        <Card key={date}>
          <CardHeader className="py-4 px-6">
            <CardTitle className="text-base font-medium">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]">Fed</TableHead>
                  <TableHead className="w-[180px]">Reptile</TableHead>
                  <TableHead className="w-[120px]">Morph</TableHead>
                  <TableHead className="w-[120px]">Species</TableHead>
                  <TableHead className="w-[300px]">Notes</TableHead>
                  <TableHead className="w-[80px] text-right">Save</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsByDate[date].map(event => (
                  <TableRow key={event.id} className={event.fed ? "bg-muted/30" : ""}>
                    <TableCell className="text-center py-4">
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
                    <TableCell className="font-medium">{event.reptile_name}</TableCell>
                    <TableCell>{event.morph_name}</TableCell>
                    <TableCell>{event.species_name}</TableCell>
                    <TableCell>
                      <Textarea 
                        value={eventNotes[event.id] || ''}
                        onChange={(e) => handleNotesChange(event.id, e.target.value)}
                        placeholder="Add feeding notes..."
                        className="h-[70px] resize-none"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingEventId === event.id}
                        onClick={() => handleSaveNotes(event.id)}
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 