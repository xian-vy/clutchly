'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from "@/components/ui/card";
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
import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Loader2, Save } from 'lucide-react';
import { getSortedReptiles, saveEventNotes } from './utils';
import { QueryClient } from '@tanstack/react-query';
import { useGroupedFeederSelect } from '@/lib/hooks/useGroupedFeederSelect';

interface Props {
  date: string;
  eventsByDate: Record<string, FeedingEventWithDetails[]>;
  events: FeedingEventWithDetails[];
  sortBy: 'species' | 'name' | 'morph' | 'all';
  schedule: FeedingScheduleWithTargets,
  queryClient: QueryClient,
  activeTarget: FeedingTargetWithDetails | null,
  onEventsUpdated?: () => void,
  eventNotes: Record<string, string>;
  updatingEventId: string | null,
  handleNotesChange: (eventId: string, notes: string) => void,
  handleUpdateEvent: (eventId: string, fed: boolean) => void,
  handleFeederTypeChange: (eventId: string, feederSizeId: string) => void
  feederTypeSize: Record<string, string>;
}

const FeedingEventsList = ({
    date,
    eventsByDate,
    events,
    sortBy,
    schedule,
    queryClient,
    onEventsUpdated,
    eventNotes,
    updatingEventId,
    handleNotesChange,
    handleUpdateEvent, 
    handleFeederTypeChange,
    feederTypeSize
}: Props) => {
  const { FeederSelect } = useGroupedFeederSelect();
  return (
    <div>
      <CardContent className="py-0 px-4">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[60px] py-1 sm:py-2 xl:py-3 text-center">Fed</TableHead>
                <TableHead className="w-[160px] py-1 sm:py-2 xl:py-3">Reptile</TableHead>
                <TableHead className="w-[120px] py-1 sm:py-2 xl:py-3">Morph</TableHead>
                <TableHead className="w-[120px] py-1 sm:py-2 xl:py-3">Species</TableHead>
                <TableHead className="w-[120px] py-1 sm:py-2 xl:py-3">Feeder</TableHead>
                <TableHead className="w-[300px] py-1 sm:py-2 xl:py-3">Notes</TableHead>
                <TableHead className="w-[70px] py-1 sm:py-2 xl:py-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedReptiles(eventsByDate[date], sortBy).map((event) => (
                <TableRow key={event.id} className={event.fed ? "bg-muted/30" : ""}>
                  <TableCell className="text-center py-1 sm:py-2 xl:py-3">
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
                  <TableCell className="py-1 sm:py-2 xl:py-3">
                    <div className="font-normal">
                      {event.reptile_name}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 sm:py-2 xl:py-3">{event.morph_name}</TableCell>
                  <TableCell className="py-1 sm:py-2 xl:py-3">{event.species_name}</TableCell>
                  <TableCell className="py-1 sm:py-2 xl:py-3">
                    <FeederSelect
                      value={feederTypeSize[event.id] || ''}
                      onValueChange={(value) => {
                        handleFeederTypeChange(event.id, value);
                      }}
                      placeholder="Select feeder"
                    
                    />
                  </TableCell>
                  <TableCell className="py-1 sm:py-2 xl:py-3">
                    <Textarea 
                      placeholder="Add notes (optional)"
                      value={eventNotes[event.id] || ''}
                      onChange={(e) => handleNotesChange(event.id, e.target.value)}
                      className="min-h-[30px] min-w-[150px] max-w-[300px] text-xs placeholder:text-sm"
                    />
                  </TableCell>
                  <TableCell className="py-1 sm:py-2 xl:py-3 text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      disabled={updatingEventId === event.id}
                      onClick={() => saveEventNotes(event.id, eventNotes[event.id] || null, schedule.id, events, queryClient, onEventsUpdated)}
                 >
                      {updatingEventId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
  )
}

export default FeedingEventsList