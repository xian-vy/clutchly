'use client';

import { getFeedingEvents } from '@/app/api/feeding/events';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useResource } from '@/lib/hooks/useResource';
import { FeedingEventWithDetails, FeedingScheduleWithTargets, NewFeedingSchedule } from '@/lib/types/feeding';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import { AlertCircle, Calendar, Check, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { FeedingEventsList } from './FeedingEventsList';

interface ScheduleStatus {
  totalEvents: number;
  completedEvents: number;
  isComplete: boolean;
  percentage: number;
  scheduledDate: string;
}

export function FeedingTab() {
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Use the resource hook for schedules
  const {
    resources: schedules,
    isLoading: schedulesLoading,
  } = useResource<FeedingScheduleWithTargets, NewFeedingSchedule>({
    resourceName: 'Feeding Schedule',
    queryKey: ['feeding-schedules'],
    getResources: getFeedingSchedules,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  // Create a query for feeding status
  const { 
    data: scheduleStatus = {},
    isLoading: statusLoading,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['feeding-status'],
    queryFn: async () => {
      const statuses: Record<string, ScheduleStatus> = {};
      
      if (schedules.length === 0) return statuses;
      
      await Promise.all(schedules.map(async (schedule) => {
        try {
          const events = await getFeedingEvents(schedule.id);
          const today = startOfDay(new Date());
          const todayString = format(today, 'yyyy-MM-dd');
          
          let relevantEvents: FeedingEventWithDetails[] = [];
          let scheduledDate = todayString;
          
          if (schedule.recurrence === 'daily') {
            // For daily schedules, use today's events
            relevantEvents = events.filter(event => event.scheduled_date === todayString);
          } else if (schedule.recurrence === 'weekly') {
            // For weekly schedules, find the current or most recent feeding day
            const startDate = new Date(schedule.start_date);
            const startDayOfWeek = startDate.getDay();
            const currentDayOfWeek = today.getDay();
            
            // Calculate the most recent or current feeding day
            let targetDate: Date;
            
            if (startDayOfWeek === currentDayOfWeek) {
              // Today is a feeding day
              targetDate = today;
            } else {
              // Find most recent feeding day
              let daysToSubtract = (currentDayOfWeek - startDayOfWeek + 7) % 7;
              if (daysToSubtract === 0) daysToSubtract = 7; // If we get 0, we want the previous week
              
              targetDate = new Date(today);
              targetDate.setDate(targetDate.getDate() - daysToSubtract);
            }
            
            scheduledDate = format(targetDate, 'yyyy-MM-dd');
            relevantEvents = events.filter(event => event.scheduled_date === scheduledDate);
            
            // If no events found for the calculated date, try using any events from the last 7 days
            if (relevantEvents.length === 0) {
              // Look for any feeding events in the past week
              const oneWeekAgo = new Date(today);
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              
              // Sort by date descending to get most recent first
              const recentEvents = events
                .filter(event => {
                  const eventDate = new Date(event.scheduled_date);
                  return eventDate >= oneWeekAgo && eventDate <= today;
                })
                .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
              
              if (recentEvents.length > 0) {
                // Use the most recent event date
                scheduledDate = recentEvents[0].scheduled_date;
                relevantEvents = recentEvents.filter(event => event.scheduled_date === scheduledDate);
              }
            }
          } else if (schedule.recurrence === 'custom') {
            // For custom schedules, check if today is a feeding day
            const dayOfWeek = today.getDay();
            
            if (schedule.custom_days?.includes(dayOfWeek)) {
              // Today is a feeding day, use today's events
              relevantEvents = events.filter(event => event.scheduled_date === todayString);
            } else {
              // Find the most recent feeding day
              let daysToLookBack = 1;
              let foundEvents = false;
              
              while (daysToLookBack <= 7 && !foundEvents) {
                const previousDay = new Date(today);
                previousDay.setDate(today.getDate() - daysToLookBack);
                
                if (schedule.custom_days?.includes(previousDay.getDay())) {
                  const previousDayString = format(previousDay, 'yyyy-MM-dd');
                  const previousEvents = events.filter(event => event.scheduled_date === previousDayString);
                  
                  if (previousEvents.length > 0) {
                    relevantEvents = previousEvents;
                    scheduledDate = previousDayString;
                    foundEvents = true;
                  }
                }
                
                daysToLookBack++;
              }
            }
          }
          
          // Get all reptiles that should be fed for this schedule
          let totalReptilesToFeed = 0;
          
          // Count reptiles from all targets
          await Promise.all(schedule.targets.map(async (target) => {
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
          
          const completedEvents = relevantEvents.filter(event => event.fed).length;
          const isComplete = totalReptilesToFeed > 0 && completedEvents === totalReptilesToFeed;
          const percentage = totalReptilesToFeed === 0 ? 0 : Math.round((completedEvents / totalReptilesToFeed) * 100);
          
          statuses[schedule.id] = {
            totalEvents: totalReptilesToFeed,
            completedEvents,
            isComplete,
            percentage,
            scheduledDate
          };
        } catch (error) {
          console.error(`Error loading status for schedule ${schedule.id}:`, error);
        }
      }));
      
      return statuses;
    },
    enabled: schedules.length > 0,
    staleTime: 30000, // 30 seconds
  });

  const refreshStatus = useCallback(() => {
    refetchStatus();
    queryClient.invalidateQueries({ queryKey: ['feeding-events'] });
  }, [refetchStatus, queryClient]);

  const toggleExpanded = (scheduleId: string) => {
    setExpandedScheduleIds(current => {
      const newSet = new Set(current);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  // Format recurrence display
  const getRecurrenceDisplay = (schedule: FeedingScheduleWithTargets) => {
    switch (schedule.recurrence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        if (!schedule.custom_days || schedule.custom_days.length === 0) {
          return 'Custom';
        }
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = schedule.custom_days.sort().map(day => dayNames[day]);
        return `Custom (${days.join(', ')})`;
    }
  };

  // Get next feeding day for the schedule
  const getNextFeedingDay = (schedule: FeedingScheduleWithTargets): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (schedule.recurrence === 'daily') {
      return today;
    } else if (schedule.recurrence === 'weekly') {
      const startDate = new Date(schedule.start_date);
      const startDayOfWeek = startDate.getDay();
      const currentDayOfWeek = today.getDay();
      
      if (startDayOfWeek === currentDayOfWeek) {
        return today;
      } else {
        let daysToAdd = (startDayOfWeek - currentDayOfWeek + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7; // If we'd get today, we want next week
        
        const nextDate = new Date(today);
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        return nextDate;
      }
    } else if (schedule.recurrence === 'custom' && schedule.custom_days) {
      const currentDayOfWeek = today.getDay();
      
      if (schedule.custom_days.includes(currentDayOfWeek)) {
        return today;
      } else {
        // Find the next day that matches the custom day pattern
        let nearestDay = 7; // Max days to look ahead
        
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() + i);
          const checkDayOfWeek = checkDate.getDay();
          
          if (schedule.custom_days.includes(checkDayOfWeek)) {
            nearestDay = i;
            break;
          }
        }
        
        const nextDate = new Date(today);
        nextDate.setDate(nextDate.getDate() + nearestDay);
        return nextDate;
      }
    }
    
    return today;
  };

  // Calculate schedule stats
  const getScheduleStats = async (schedule: FeedingScheduleWithTargets) => {
    // Count location-related targets (location, room, rack, level)
    const locationRelatedTargets = schedule.targets.filter(
      (target) => ['location', 'room', 'rack', 'level'].includes(target.target_type)
    );
    
    // Count direct reptile targets
    const reptileTargets = schedule.targets.filter(
      (target) => target.target_type === 'reptile'
    );
    
    let estimatedReptileCount = reptileTargets.length;
    
    // Get actual reptile counts from location-related targets
    try {
      const reptileCounts = await Promise.all(
        locationRelatedTargets.map(async (target) => {
          const reptiles = await getReptilesByLocation(
            target.target_type as 'room' | 'rack' | 'level' | 'location',
            target.target_id
          );
          return reptiles.length;
        })
      );
      
      estimatedReptileCount += reptileCounts.reduce((sum, count) => sum + count, 0);
    } catch (error) {
      console.error('Error counting reptiles:', error);
      // Fallback to simple estimation if query fails
      estimatedReptileCount += locationRelatedTargets.length;
    }
    
    // Calculate next feeding date
    const nextFeedingDate = getNextFeedingDay(schedule);
    
    return {
      locationCount: locationRelatedTargets.length,
      reptileCount: estimatedReptileCount,
      nextFeedingDate
    };
  };

  // Add a new query for schedule stats
  const { data: scheduleStats = {} } = useQuery({
    queryKey: ['schedule-stats', schedules],
    queryFn: async () => {
      const stats: Record<string, { locationCount: number; reptileCount: number; nextFeedingDate: Date }> = {};
      
      await Promise.all(
        schedules.map(async (schedule) => {
          stats[schedule.id] = await getScheduleStats(schedule);
        })
      );
      
      return stats;
    },
    enabled: schedules.length > 0
  });

  const isLoading = schedulesLoading || statusLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Feeding Schedules</CardTitle>
          <CardDescription>
            Create a feeding schedule to get started with managing your reptile feeding.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => toast.info('Navigate to Schedules tab to create a new schedule')}>
            Create Your First Schedule
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Check if there are incomplete schedules for today
    const incompleteSchedules = Object.entries(scheduleStatus)
    .filter(entry => entry[1].totalEvents > 0 && !entry[1].isComplete)
    .length;

  return (
    <div className="space-y-6">
   
      <div className="flex justify-between items-center">
        {incompleteSchedules > 0 ? (
          <Alert variant="info" className="flex-1 mr-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feeding reminder</AlertTitle>
            <AlertDescription>
              You have {incompleteSchedules} feeding schedule{incompleteSchedules > 1 ? 's' : ''} that need{incompleteSchedules === 1 ? 's' : ''} to be completed today.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex-1" />
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.map((schedule) => {
          const stats = scheduleStats[schedule.id] || { locationCount: 0, reptileCount: 0, nextFeedingDate: new Date() };
          const status = scheduleStatus[schedule.id];
          const isActiveToday = status?.scheduledDate === format(new Date(), 'yyyy-MM-dd');
          //const nextFeedingFormatted = format(stats.nextFeedingDate, 'MMM d, yyyy');
          const feedingDateString = status?.scheduledDate 
            ? format(new Date(status.scheduledDate), 'MMM d, yyyy')
            : null;
            
          return (
            <Collapsible
              key={schedule.id}
              open={expandedScheduleIds.has(schedule.id)}
              onOpenChange={() => toggleExpanded(schedule.id)}
              className="border rounded-lg overflow-hidden bg-white dark:bg-card"
            >
              <Card className="border-0 shadow-none gap-5 3xl:gap-6">
                <CardHeader className="pb-0 px-6">
                  <div className="flex  items-center gap-5 2xl:gap-7">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl flex flex-col items-start">
                          {schedule.name}
                          <div className="flex items-center gap-1">
                              <Calendar strokeWidth={1.5} className="h-3 w-3 text-muted-foreground" />
                              <div className="text-xs font-normal text-muted-foreground">{getRecurrenceDisplay(schedule)}</div>        
                          </div>
                        </CardTitle>
                      
                      </div>

                    </div>
                    <div className='flex-1'>
                    {statusLoading ? (
                        <div className="h-8 flex items-center justify-center mb-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                        ) : status && status.totalEvents > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>
                                {isActiveToday ? 'Today\'s progress' : `Progress for ${feedingDateString}`}
                              </span>
                              <span>{status.percentage}%</span>
                            </div>
                            <Progress value={status.percentage} className="h-2" />
                          </div>
                        )}
                    </div>
                    <div>
                      {status && status.totalEvents > 0 && (
                          <Badge variant={status.isComplete ? "secondary" : "default"} className={`${status.isComplete ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300" : ""}`}>
                            {status.isComplete ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" /> Completed
                              </span>
                            ) : (
                              <span>{status.completedEvents}/{status.totalEvents} fed</span>
                            )}
                          </Badge>
                        )}
                    </div>
                  </div>
                  <div>
                     {schedule.description ? (
                        <CardDescription className="mt-2">{schedule.description}</CardDescription>
                      ):(
                        <CardDescription className="mt-2">No Description for this Schedule</CardDescription>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="pb-0 px-6 flex justify-between w-full items-center">        

                  <div className="flex flex-wrap gap-1 mb-1">
                    {schedule.targets[0] && schedule.targets[0].target_type === 'reptile' &&
                      <Badge variant="secondary" className="text-xs capitalize">
                        {`Target: Selected ${schedule.targets[0].target_type}`}
                      </Badge>
                      }
                      { schedule.targets
                      .filter(target => ['location', 'room', 'rack', 'level'].includes(target.target_type))
                      .map((target, index) => {
                        let label = "Unknown location";
                        let tooltipContent = "Location";
                        
                        if (target.target_type === 'location' && target.location_label) {
                          label = target.location_label;
                          tooltipContent = `Location: ${target.location_label}`;
                        }
                        else if (target.target_type === 'room' && target.room_name) {
                          label = `Target: ${target.room_name}`;
                          tooltipContent = `Room: ${target.room_name}`;
                        }
                        else if (target.target_type === 'rack' && target.rack_name) {
                          label = `Target: ${target.rack_name}`;
                          tooltipContent = `Rack: ${target.rack_name}`;
                        }
                        else if (target.target_type === 'level' && target.rack_name && target.level_number) {
                          label = `Target: ${target.level_number}`;
                          tooltipContent = `Level ${target.level_number} in ${target.rack_name}`;
                        } 
                        
                        return (
                          <TooltipProvider key={`loc-${target.id}-${index}`}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{tooltipContent}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}             
                  </div>
                  <Badge variant="secondary" className="text-xs">
                        {stats.reptileCount || 0} reptiles
                  </Badge>
                </CardContent>
              </Card>
                <div className=" px-4">
                  <FeedingEventsList 
                    scheduleId={schedule.id} 
                    schedule={schedule}
                    onEventsUpdated={refreshStatus} 
                  />
                </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}