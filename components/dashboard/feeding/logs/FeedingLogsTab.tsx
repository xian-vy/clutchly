'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  FileText, 
  Filter, 
  Loader2, 
  Search, 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { format } from 'date-fns';
import { getFeedingEvents } from '@/app/api/feeding/events';
import { FeedingEventWithDetails } from '@/lib/types/feeding';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { createClient } from '@/lib/supabase/client';

export function FeedingLogsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<FeedingEventWithDetails[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<FeedingEventWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'fed' | 'unfed'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Load all feeding events
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        // Since we're loading all events, we'll create a workaround 
        // by fetching events for each schedule
        const supabase = createClient();
        const { data: schedules } = await supabase
          .from('feeding_schedules')
          .select('id');
          
        if (schedules && schedules.length > 0) {
          // Fetch events for each schedule and combine them
          const allEventsPromises = schedules.map((s: { id: string }) => getFeedingEvents(s.id));
          const eventsArrays = await Promise.all(allEventsPromises);
          const allEvents = eventsArrays.flat();
          
          setEvents(allEvents);
          setFilteredEvents(allEvents);
        } else {
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (error) {
        console.error('Error loading feeding events:', error);
        toast.error('Failed to load feeding events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.reptile_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.species_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.morph_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => 
        filterStatus === 'fed' ? event.fed : !event.fed
      );
    }

    // Apply date range filter
    if (dateRange.from) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.scheduled_date);
        return eventDate >= dateRange.from!;
      });
    }

    if (dateRange.to) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.scheduled_date);
        return eventDate <= dateRange.to!;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterStatus, dateRange]);

  // Handle report generation
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportData = {
        reportDate: format(new Date(), 'yyyy-MM-dd'),
        totalEvents: filteredEvents.length,
        fedCount: filteredEvents.filter(e => e.fed).length,
        unfedCount: filteredEvents.filter(e => !e.fed).length,
        dateRange: {
          from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'All time',
          to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'Present',
        }
      };
      
      console.log('Report data:', reportData);
      
      toast.success('Report generated successfully!');
      // In a real implementation, this would trigger a download or open a report view
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateRange({ from: undefined, to: undefined });
  };

  // Get the current date
  const today = new Date();

  // Get summary stats
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.fed).length;
  const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  // Get events in the last 7 days
  const last7DaysEvents = events.filter(e => {
    const eventDate = new Date(e.scheduled_date);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return eventDate >= sevenDaysAgo && eventDate <= today;
  });

  const last7DaysCompleted = last7DaysEvents.filter(e => e.fed).length;
  const last7DaysRate = last7DaysEvents.length > 0 
    ? Math.round((last7DaysCompleted / last7DaysEvents.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feeding Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedEvents} completed ({completionRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last7DaysEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {last7DaysCompleted} completed ({last7DaysRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Feedings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.scheduled_date === format(today, 'yyyy-MM-dd')).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(today, 'EEEE, MMM d')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Event Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-end">
                {/* Search */}
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm mb-2">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by reptile, species..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-[180px]">
                  <Label htmlFor="status" className="text-sm mb-2">Status</Label>
                  <Select 
                    value={filterStatus} 
                    onValueChange={(value) => setFilterStatus(value as any)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All events</SelectItem>
                      <SelectItem value="fed">Fed only</SelectItem>
                      <SelectItem value="unfed">Unfed only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="w-full md:w-[240px]">
                  <Label htmlFor="date" className="text-sm mb-2">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          "All time"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range) {
                            setDateRange(range);
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="h-10 px-4"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Feeding Events</CardTitle>
              <CardDescription>
                Showing {filteredEvents.length} events
                {searchTerm && ` matching "${searchTerm}"`}
                {filterStatus !== 'all' && ` with status "${filterStatus}"`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredEvents.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="text-muted-foreground mb-2">No events found</div>
                    <div className="text-sm text-muted-foreground">
                      Try adjusting your filters to see more results.
                    </div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Reptile</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Morph</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {format(new Date(event.scheduled_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{event.reptile_name}</TableCell>
                        <TableCell>{event.species_name}</TableCell>
                        <TableCell>{event.morph_name || "-"}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {event.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={event.fed ? "default" : "outline"}
                            className={event.fed ? "bg-green-500" : ""}
                          >
                            {event.fed ? "Fed" : "Not Fed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Reports</CardTitle>
              <CardDescription>
                Generate and export feeding data reports
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium mb-1">Feeding Summary Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate a summary of all feeding events for the selected period.
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground border-t pt-4">
                The report will use the same filters you've applied in the Event Logs tab.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 