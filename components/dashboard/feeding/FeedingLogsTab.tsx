'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { getFeedingEvents } from '@/app/api/feeding/events';
import { FeedingLogsList } from './logs/FeedingLogsList';
import { useFeedersStore } from '@/lib/stores/feedersStore';
import { FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { useAuthStore } from '@/lib/stores/authStore';

export interface FeedingEventNormalized {
  id: string;
  scheduled_date: string;
  reptile_code : string;
  reptile_name: string;
  species_name: string;
  morph_name?: string | null;
  fed: boolean;
  notes?: string | null;
  feeder: string;
}

export function FeedingLogsTab() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'fed' | 'unfed'>('all');
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today,
  });
  const {feederSizes, feederTypes} = useFeedersStore();
  const {organization} = useAuthStore()

  const { data: schedules = [], isLoading : schedulesLoading } = useQuery<FeedingScheduleWithTargets[]>({
    queryKey: ['feeding-schedules'],
    queryFn: async () => {
      if (!organization) return [];
      return getFeedingSchedules(organization);
    },
  });

  const { 
    data: events = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<FeedingEventNormalized[]>({
    queryKey: ['feeding-events-logs', dateRange],
    queryFn: async () => {
      try {
        if (schedules && schedules.length > 0) {
          const allEventsPromises = schedules.map((s: { id: string }) => 
            getFeedingEvents(s.id, {
              startDate: dateRange.from?.toISOString(),
              endDate: dateRange.to?.toISOString()
            })
          );
          const eventsArrays = await Promise.all(allEventsPromises);
          const eventsArrayWithFeeder = eventsArrays.map(events => {
            return events.map(event => {
              const feederSize = feederSizes.find(f => f.id === event.feeder_size_id);
              const feederType = feederTypes.find(f => f.id === feederSize?.feeder_type_id);
              return {
                ...event,
                feeder: feederSize && feederType ? `${feederType.name} > ${feederSize.name}` : '-',
              };
            });
          });
          return eventsArrayWithFeeder.flat() as FeedingEventNormalized[];
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error loading feeding events:', error);
        throw error;
      }
    },
    staleTime: 50 * 60 * 1000, 
    refetchOnWindowFocus: true,
    enabled: !schedulesLoading,
  });

  const filteredEvents = events.filter((event: FeedingEventNormalized) => {
    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'fed' && !event.fed) return false;
      if (filterStatus === 'unfed' && event.fed) return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
      <FeedingLogsList 
        events={filteredEvents}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
    </div>
  );
}