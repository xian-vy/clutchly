import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, ArrowUp, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface FeedingEvent {
  id: string;
  scheduled_date: string;
  reptile_name: string;
  species_name: string;
  morph_name?: string | null;
  fed: boolean;
  notes?: string | null;
}

interface FeedingEventsTableProps {
  events: FeedingEvent[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: 'all' | 'fed' | 'unfed';
  setFilterStatus: (value: 'all' | 'fed' | 'unfed') => void;
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
  clearFilters: () => void;
}

export function FeedingEventsTable({ 
  events,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
  clearFilters
}: FeedingEventsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<keyof FeedingEvent>('scheduled_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (sortField === 'scheduled_date') {
      const dateA = new Date(a.scheduled_date).getTime();
      const dateB = new Date(b.scheduled_date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    const valueA = a[sortField] || '';
    const valueB = b[sortField] || '';
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return 0;
  });
  
  const rowVirtualizer = useVirtualizer({
    count: sortedEvents.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });

  const handleSort = (field: keyof FeedingEvent) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof FeedingEvent }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm !== '' || 
    filterStatus !== 'all' || 
    dateRange.from !== undefined || 
    dateRange.to !== undefined;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Feeding Events</CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search" className="mb-2 block text-sm">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search reptiles, species, or notes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="status" className="mb-2 block text-sm">Status</Label>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as 'all' | 'fed' | 'unfed')}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="fed">Fed</SelectItem>
                <SelectItem value="unfed">Not Fed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date" className="mb-2 block text-sm">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchTerm}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filterStatus !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {filterStatus === 'fed' ? 'Fed' : 'Not Fed'}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => setFilterStatus('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {dateRange.from && (
              <Badge variant="outline" className="flex items-center gap-1">
                Date: {format(dateRange.from, "MMM d, yyyy")}
                {dateRange.to && ` - ${format(dateRange.to, "MMM d, yyyy")}`}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Table */}
        <div 
          ref={tableContainerRef} 
          className="h-[400px] overflow-auto border rounded-md"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('scheduled_date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="scheduled_date" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('reptile_name')}
                >
                  <div className="flex items-center gap-1">
                    Reptile
                    <SortIcon field="reptile_name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('species_name')}
                >
                  <div className="flex items-center gap-1">
                    Species
                    <SortIcon field="species_name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('morph_name')}
                >
                  <div className="flex items-center gap-1">
                    Morph
                    <SortIcon field="morph_name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('fed')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="fed" />
                  </div>
                </TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No feeding events found that match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const event = sortedEvents[virtualRow.index];
                  return (
                    <TableRow 
                      key={event.id} 
                      className={event.fed ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/30"}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(event.scheduled_date), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{event.reptile_name}</TableCell>
                      <TableCell>{event.species_name}</TableCell>
                      <TableCell>{event.morph_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={event.fed ? "outline" : "secondary"}>
                          {event.fed ? "Fed" : "Not Fed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {event.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {sortedEvents.length} events
          </p>
          <Button variant="outline" size="sm" onClick={() => tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ArrowUp className="h-4 w-4 mr-1" />
            Back to top
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 