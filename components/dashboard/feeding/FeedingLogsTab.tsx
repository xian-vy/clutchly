'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function FeedingLogsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'fed' | 'unfed'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Use TanStack Query to fetch and cache feeding events
  const { 
    data: events = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['feeding-events'],
    queryFn: async () => {
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
          return eventsArrays.flat();
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error loading feeding events:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Apply filters to events
  const filteredEvents = events.filter(event => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        event.reptile_name.toLowerCase().includes(searchLower) ||
        event.species_name.toLowerCase().includes(searchLower) ||
        (event.morph_name && event.morph_name.toLowerCase().includes(searchLower)) ||
        (event.notes && event.notes.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'fed' && !event.fed) return false;
      if (filterStatus === 'unfed' && event.fed) return false;
    }

    // Apply date range filter
    if (dateRange.from) {
      const eventDate = new Date(event.scheduled_date);
      if (eventDate < dateRange.from) return false;
    }

    if (dateRange.to) {
      const eventDate = new Date(event.scheduled_date);
      if (eventDate > dateRange.to) return false;
    }

    return true;
  });

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <p className="text-destructive">Failed to load feeding events</p>
        <Button onClick={() => refetch()}>Retry</Button>
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
              Today&apos; Feedings
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
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
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
                  </div>
                </div>
                <div className="w-full md:w-[180px]">
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
                <div className="w-full md:w-[250px]">
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={clearFilters}
                  className="h-10 w-10"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Logs Table */}
          <Card>
            <CardContent className="py-0 px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reptile</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Morph</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No feeding events found that match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id} className={event.fed ? "bg-muted/30" : ""}>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feeding Reports</CardTitle>
              <CardDescription>
                Generate comprehensive reports on feeding patterns and completion rates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-type" className="mb-2 block">Report Type</Label>
                  <Select defaultValue="summary">
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Log</SelectItem>
                      <SelectItem value="reptile">Per-Reptile Stats</SelectItem>
                      <SelectItem value="species">Per-Species Stats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="report-format" className="mb-2 block">Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger id="report-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Applied Filters</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Status: {filterStatus === 'all' ? 'All Events' : filterStatus === 'fed' ? 'Fed Only' : 'Unfed Only'}</p>
                  <p>Date Range: {dateRange.from 
                    ? `${format(dateRange.from, 'MMM d, yyyy')} - ${dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Present'}`
                    : 'All time'
                  }</p>
                  <p>Matching Events: {filteredEvents.length}</p>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || filteredEvents.length === 0}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}