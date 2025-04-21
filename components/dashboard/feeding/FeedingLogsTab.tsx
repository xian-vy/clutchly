'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getFeedingEvents } from '@/app/api/feeding/events';
import { format } from 'date-fns';

// Import our new modular components
import { SummaryCards } from './logs/SummaryCards';
import { FeedingEventsTable } from './logs/FeedingEventsTable';
import { ReportsPanel } from './logs/ReportsPanel';

// Define the FeedingEvent interface to match the data structure
interface FeedingEvent {
  id: string;
  scheduled_date: string;
  reptile_name: string;
  species_name: string;
  morph_name?: string | null;
  fed: boolean;
  notes?: string | null;
}

export function FeedingLogsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'fed' | 'unfed'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(), // Set today as default date
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
          return eventsArrays.flat() as FeedingEvent[];
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
    setDateRange({ from: new Date(), to: undefined }); // Reset to today
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

  // Get today's events
  const todayEvents = events.filter(e => 
    e.scheduled_date === format(today, 'yyyy-MM-dd')
  ).length;

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
      <SummaryCards 
        totalEvents={totalEvents}
        completedEvents={completedEvents}
        completionRate={completionRate}
        last7DaysEvents={last7DaysEvents.length}
        last7DaysCompleted={last7DaysCompleted}
        last7DaysRate={last7DaysRate}
        todayEvents={todayEvents}
      />

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Event Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          {/* Combined FilterBar and FeedingEventsTable */}
          <FeedingEventsTable 
            events={filteredEvents}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            clearFilters={clearFilters}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsPanel 
            filterStatus={filterStatus}
            dateRange={dateRange}
            filteredEventsCount={filteredEvents.length}
            isGeneratingReport={isGeneratingReport}
            onGenerateReport={handleGenerateReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}