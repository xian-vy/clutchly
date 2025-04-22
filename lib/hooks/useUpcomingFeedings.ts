import { getFeedingEvents } from "@/app/api/feeding/events";
import { getReptilesByLocation } from "@/app/api/reptiles/byLocation";
import { FeedingScheduleWithTargets } from "@/lib/types/feeding";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, parseISO } from "date-fns";
import { useCallback } from "react";

export function useUpcomingFeedings(schedules: FeedingScheduleWithTargets[]) {
  const queryClient = useQueryClient();

  // Get upcoming feeding days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const getUpcomingFeedingDates = (schedule: FeedingScheduleWithTargets): Date[] => {
    const dates: Date[] = [];
    const startDate = parseISO(schedule.start_date);
    const endDate = schedule.end_date ? parseISO(schedule.end_date) : null;
    
    // If schedule has ended or hasn't started yet, return empty array
    if (
      (endDate && endDate < today) || 
      startDate > today
    ) {
      return [];
    }
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      // Skip if beyond end date
      if (endDate && checkDate > endDate) {
        continue;
      }
      
      const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check if this day is a feeding day
      let isFeedingDay = false;
      
      switch (schedule.recurrence) {
        case 'daily':
          isFeedingDay = true;
          break;
        case 'weekly':
          // For weekly schedules, check if the day of week matches the start date's day of week
          const startDayOfWeek = startDate.getDay();
          isFeedingDay = checkDate.getDay() === startDayOfWeek;
          break;
        case 'interval':
          // For interval schedules, check if the number of days since start date is divisible by interval_days
          if (schedule.interval_days) {
            const daysSinceStart = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            isFeedingDay = daysSinceStart >= 0 && daysSinceStart % schedule.interval_days === 0;
          }
          break;
        case 'custom':
          isFeedingDay = schedule.custom_days?.includes(dayOfWeek) || false;
          break;
      }
      
      if (isFeedingDay) {
        dates.push(new Date(checkDate));
      }
    }
    
    return dates;
  };

  // Use tanstack query for upcoming feedings
  const { 
    data: upcomingFeedings = [], 
    isLoading: isLoadingStatus,
    refetch: refreshStatus 
  } = useQuery({
    queryKey: ['upcoming-feedings', schedules.map(s => s.id).join(',')],
    queryFn: async () => {
      try {
        // Get the next feeding dates for all schedules
        const feedingsWithoutStatus = schedules.flatMap(schedule => {
          const dates = getUpcomingFeedingDates(schedule);
          return dates.map(date => ({
            schedule,
            date,
            isCompleted: false,
            totalEvents: 0,
            completedEvents: 0
          }));
        });
        
        // Sort by date
        feedingsWithoutStatus.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Only keep the next 5 upcoming feedings
        const nearestFeedings = feedingsWithoutStatus.slice(0, 5);
        
        // Fetch feeding status for each schedule
        const feedingsWithStatus = await Promise.all(
          nearestFeedings.map(async (feeding) => {
            const events = await getFeedingEvents(feeding.schedule.id);
            
            // Get all reptiles that should be fed for this schedule
            let totalReptilesToFeed = 0;
            
            // Count reptiles from all targets
            await Promise.all(feeding.schedule.targets.map(async (target) => {
              if (target.target_type === 'reptile') {
                totalReptilesToFeed += 1;
              } else {
                try {
                  const reptiles = await getReptilesByLocation(
                    target.target_type as 'room' | 'rack' | 'level' | 'location',
                    target.target_id
                  );
                  totalReptilesToFeed += reptiles.length;
                } catch (error) {
                  console.error('Error counting reptiles:', error);
                }
              }
            }));
  
            let relevantEvents: typeof events = [];
            const todayString = format(today, 'yyyy-MM-dd');
            const feedingDateString = format(feeding.date, 'yyyy-MM-dd');
            
            if (feeding.schedule.recurrence === 'daily') {
              if (isToday(feeding.date)) {
                relevantEvents = events.filter(event => event.scheduled_date === todayString);
              }
            } else if (feeding.schedule.recurrence === 'weekly') {
              // For weekly schedules, we need to check if the event date matches the feeding date
              // or if it's from the same week (same day of week)
              const feedingDayOfWeek = feeding.date.getDay();
              const startDate = parseISO(feeding.schedule.start_date);
              const startDayOfWeek = startDate.getDay();
              
              // If the feeding day matches the start day of week, use events from that date
              if (feedingDayOfWeek === startDayOfWeek) {
                relevantEvents = events.filter(event => event.scheduled_date === feedingDateString);
              }
            } else if (feeding.schedule.recurrence === 'interval') {
              // For interval schedules, only check events for the specific feeding date
              relevantEvents = events.filter(event => event.scheduled_date === feedingDateString);
            } else if (feeding.schedule.recurrence === 'custom') {
              if (isToday(feeding.date)) {
                relevantEvents = events.filter(event => event.scheduled_date === todayString);
              }
            }
            
            const completedEvents = relevantEvents.filter(event => event.fed).length;
            
            return {
              ...feeding,
              isCompleted: totalReptilesToFeed > 0 && completedEvents === totalReptilesToFeed,
              totalEvents: totalReptilesToFeed,
              completedEvents
            };
          })
        );
        
        return feedingsWithStatus;
      } catch (error) {
        console.error("Error fetching feeding status:", error);
        return [];
      }
    },
    enabled: schedules.length > 0,
    staleTime: 3000000, // 30 seconds
  });
  
  const handleRefreshStatus = useCallback(() => {
    refreshStatus();
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    queryClient.invalidateQueries({ queryKey: ['feeding-events'] });
  }, [refreshStatus, queryClient]);

  return {
    upcomingFeedings,
    isLoadingStatus,
    refreshStatus: handleRefreshStatus
  };
}