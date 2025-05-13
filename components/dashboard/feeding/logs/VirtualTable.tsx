import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FeedingEventNormalized } from '../FeedingLogsTab';



interface VirtualTableProps {
  events: FeedingEventNormalized[];
  sortField: keyof FeedingEventNormalized;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof FeedingEventNormalized) => void;
}

export function VirtualTable({ 
  events, 
  sortField, 
  sortDirection, 
  onSort 
}: VirtualTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });

  const SortIcon = ({ field }: { field: keyof FeedingEventNormalized }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div 
      ref={tableContainerRef} 
      className="h-[400px]  max-w-[340px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto  border rounded-md relative"
    >
      {/* Table Header */}
      <div className="sticky top-0 bg-background z-10 border-b">
        <div className="flex w-full">
          <div 
            className="flex-1 p-3 font-medium text-sm cursor-pointer hover:bg-muted/50"
            onClick={() => onSort('scheduled_date')}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              Date
              <SortIcon field="scheduled_date" />
            </div>
          </div>
          <div 
            className="flex-1 p-3 font-medium text-sm cursor-pointer hover:bg-muted/50"
            onClick={() => onSort('reptile_name')}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              Reptile
              <SortIcon field="reptile_name" />
            </div>
          </div>
          <div 
            className="flex-1 p-3 font-medium text-sm cursor-pointer hover:bg-muted/50"
            onClick={() => onSort('species_name')}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              Species
              <SortIcon field="species_name" />
            </div>
          </div>
          <div 
            className="flex-1 p-3 font-medium text-sm cursor-pointer hover:bg-muted/50"
            onClick={() => onSort('morph_name')}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              Morph
              <SortIcon field="morph_name" />
            </div>
          </div>
          <div 
            className="flex-1 p-3 font-medium text-sm cursor-pointer hover:bg-muted/50"
            onClick={() => onSort('feeder')}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              Feeder
              <SortIcon field="feeder" />
            </div>
          </div>
          <div 
            className="flex-1 p-3 font-medium text-sm cursor-pointer hover:bg-muted/50"
            onClick={() => onSort('fed')}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              Status
              <SortIcon field="fed" />
            </div>
          </div>
          <div className="flex-1 p-3 font-medium text-xs sm:text-sm">
            Notes
          </div>
        </div>
      </div>

      {/* Table Body */}
      {events.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-center p-3 text-muted-foreground">
          No feeding events found that match your filters.
        </div>
      ) : (
        <div 
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const event = events[virtualRow.index];
            return (
              <div
                key={event.id}
                className={cn(
                  "text-sm absolute top-0 left-0 w-full flex border-b",
                  event.fed ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/30"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="flex-1 p-2 md:p-3">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-nowrap" >
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    {format(new Date(event.scheduled_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex-1 p-2 md:p-3 text-xs sm:text-sm text-nowrap">{event.reptile_name}</div>
                <div className="flex-1 p-2 md:p-3 text-xs sm:text-sm text-nowrap">{event.species_name}</div>
                <div className="flex-1 p-2 md:p-3 text-xs sm:text-sm text-nowrap">{event.morph_name || '-'}</div>
                <div className="flex-1 p-2 md:p-3 text-xs sm:text-sm text-nowrap">{event.feeder || '-'}</div>
                <div className="flex-1 p-2 md:p-3 text-xs sm:text-sm text-nowrap">
                  <Badge variant={event.fed ? "outline" : "secondary"}>
                    {event.fed ? "Fed" : "Not Fed"}
                  </Badge>
                </div>
                <div className="flex-1 p-2 md:p-3 max-w-[250px] truncate">
                  {event.notes || '-'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}