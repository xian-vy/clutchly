import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon,  Search, X } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { FeedingEventNormalized } from '../FeedingLogsTab';
import { VirtualTable } from './VirtualTable';

interface FeedingEventsTableProps {
  events: FeedingEventNormalized[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: 'all' | 'fed' | 'unfed';
  setFilterStatus: (value: 'all' | 'fed' | 'unfed') => void;
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
}

export function FeedingEventsTable({ 
  events,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
}: FeedingEventsTableProps) {
  const [sortField, setSortField] = useState<keyof FeedingEventNormalized>('scheduled_date');
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
  


  const handleSort = (field: keyof FeedingEventNormalized) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };


  // Check if any filters are active
  const hasActiveFilters = 
    searchTerm !== '' || 
    filterStatus !== 'all' || 
    dateRange.from !== undefined || 
    dateRange.to !== undefined;

  return (
    <Card>
      <CardHeader className='pb-0'>
          <CardTitle className="text-base sm:text-lg xl:text-xl">Feeding Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
          <div className="flex items-center gap-3 justify-start">
            <div>
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
          <div className='flex justify-end w-full'>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search reptiles, species, or notes..."
                className="pl-8 w-[300px] max-w-[400px]"
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
        
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
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
              <Badge variant="secondary" className="flex items-center gap-1">
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
              <Badge variant="secondary" className="flex items-center gap-1">
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
       <VirtualTable
          events={sortedEvents}
          sortField='scheduled_date'
          sortDirection='desc'
          onSort={handleSort}
        />
      </CardContent>
    </Card>
  );
} 