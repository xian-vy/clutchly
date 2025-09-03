'use client';

import { getFeedingSchedules } from '@/app/api/feeding/schedule';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpcomingFeedings } from '@/lib/hooks/useUpcomingFeedings';
import { FeedingScheduleWithTargets} from '@/lib/types/feeding';
import { useQuery, useQueryClient,  } from '@tanstack/react-query';
import { differenceInDays, format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, Calendar, Check, CheckCircle, Loader2 } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FeedingEvents } from './FeedingEvents';
import { getScheduleStats, isTodayScheduledFeedingDay } from './utils';
import { useAuthStore } from '@/lib/stores/authStore';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

export function FeedingTab() {
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set());
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const {organization} = useAuthStore()

  const { data: schedules = [], isLoading : schedulesLoading } = useQuery<FeedingScheduleWithTargets[]>({
    queryKey: [CACHE_KEYS.FEEDING_SCHEDULES],
    queryFn:  async () => {
      if (!organization) return [];
      return getFeedingSchedules(organization);
    },
    staleTime: 60 * 60 * 1000, 
  });
  const queryClient = useQueryClient();

  const { 
    upcomingFeedings, 
    isLoadingStatus: upcomingLoading,
    refreshStatus: refreshUpcoming
  } = useUpcomingFeedings();

  // Set initial active schedule when schedules load
  useEffect(() => {
    if (schedules.length > 0 && !activeScheduleId) {
      setActiveScheduleId(schedules[0].id);
    }
  }, [schedules, activeScheduleId]);

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
      case 'interval':
        return `Every ${schedule.interval_days} days`;
    }
  };

  // Add a new query for schedule stats
  const { data: scheduleStats = {} } = useQuery({
    queryKey: [CACHE_KEYS.FEEDING_SCHEDULE_STATS, schedules],
    queryFn: async () => {
      const stats: Record<string, { locationCount: number; reptileCount: number; nextFeedingDate: Date }> = {};
      
      await Promise.all(
        schedules.map(async (schedule) => {
          stats[schedule.id] = await getScheduleStats(schedule);
        })
      );
      
      return stats;
    },
    enabled: schedules.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = schedulesLoading || upcomingLoading;

  const refreshStatus = useCallback(() => {
    // Only invalidate specific queries that need updating
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FEEDING_EVENTS] });
    queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.FEEDING_STATUS] });
    refreshUpcoming();
  }, [ queryClient,refreshUpcoming]);

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
  const todayFeedings = upcomingFeedings.filter(feeding => isToday(feeding.date));
  const pendingTodayFeedings = todayFeedings.filter(feeding => !feeding.isCompleted);
  const hasPendingFeedings = pendingTodayFeedings.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        {hasPendingFeedings ? (
          <Alert variant="info" className="flex-1 ">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Feeding reminder</AlertTitle>
            <AlertDescription>
              You have {pendingTodayFeedings.length} feeding schedule{pendingTodayFeedings.length > 1 ? 's' : ''} that need{pendingTodayFeedings.length === 1 ? 's' : ''} to be completed today.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="info" className="flex-1">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>All good!</AlertTitle>
            <AlertDescription>
                You&apos;re all set with feedings for today.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={activeScheduleId || undefined} onValueChange={setActiveScheduleId} className="space-y-4">
        <TabsList className="w-full justify-start max-w-[90vw] lg:max-w-fit overflow-x-auto">
          {schedules.map((schedule) => {
            const status = upcomingFeedings.find((feeding) => feeding.schedule.id === schedule.id);
            const isTodayScheduled = isTodayScheduledFeedingDay(schedule);
            const isCompleted = status?.isCompleted;
            
            return (
              <TabsTrigger 
                key={schedule.id} 
                value={schedule.id}
                className="flex flex-col items-center gap-3  "
              >
                  <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <span className='!max-w-[50px] md:!max-w-[80px] truncate'>{schedule.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{schedule.name}</p>
                        </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                <>
                {isTodayScheduled && (
                  <Badge 
                    variant={isCompleted ? "secondary" : "default"} 
                    className={`ml-2 ${isCompleted ? "!bg-primary text-white dark:text-black" : ""}`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" /> 
                      </span>
                    ) : (
                      <span>{status?.completedEvents || 0}/{status?.totalEvents || 0}</span>
                    )}
                  </Badge>
                )}
                </>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {schedules.map((schedule) => {
          const stats = scheduleStats[schedule.id] || { locationCount: 0, reptileCount: 0, nextFeedingDate: new Date() };
          const status = upcomingFeedings.find((feeding) => feeding.schedule.id === schedule.id);
          
          // Check if the schedule was created today or in the future
          const scheduleCreatedAt = new Date(schedule.created_at);
          scheduleCreatedAt.setHours(0, 0, 0, 0);
          const today = startOfDay(new Date());
          today.setHours(0, 0, 0, 0);
          const isNewSchedule = scheduleCreatedAt > today;
          
          // Check if today is actually a scheduled feeding day
          const isTodayScheduled = isTodayScheduledFeedingDay(schedule);
          const isActiveToday = status?.date.toDateString() === format(new Date(), 'yyyy-MM-dd') && isTodayScheduled;
          
          const feedingDateString = status?.date 
            ? format(new Date(status.date), 'MMM d, yyyy')
            : null;
            
          // Calculate days until next feeding properly
          const daysUntilNext = differenceInDays(stats.nextFeedingDate, new Date());
          
          return (
            <TabsContent key={schedule.id} value={schedule.id}>
              <Collapsible
                open={expandedScheduleIds.has(schedule.id)}
                onOpenChange={() => toggleExpanded(schedule.id)}
                className="border shadow-sm rounded-lg overflow-hidden bg-white dark:bg-card"
              >
                <Card className="border-0 shadow-none gap-5 3xl:gap-6">
                  <CardHeader className="pb-0 px-6">
                    {/* Show next feeding date when schedule is completed OR not scheduled for today OR is new schedule */}
                    {(status && status.isCompleted) || !isTodayScheduled || isNewSchedule ? (
                      <div className="mb-3">
                        <Badge variant="outline" className="flex justify-between !text-xs items-center  h-8 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                         <div className='flex items-center gap-1.5'>
                            <Calendar className="h-3 w-3 mb-0.5" />
                            Next feeding: {format(stats.nextFeedingDate, 'EEEE, MMM d, yyyy')}  
                          </div>
                         <>
                           {daysUntilNext > 0 ? `${daysUntilNext} days to go` : 'Tomorrow'}
                          </>
                        </Badge>
                      </div>
                    ) : null}
                    
                    <div className="flex  items-center gap-5 2xl:gap-7">
                      <div className='flex-1'>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base lg:text-lg 3xl:text-xl flex flex-col items-start">
                            {schedule.name}
                            <div className="flex items-center gap-1">
                                <Calendar strokeWidth={1.5} className="h-3 w-3 text-muted-foreground" />
                                <div className="text-xs font-normal text-muted-foreground">{getRecurrenceDisplay(schedule)}</div>        
                            </div>
                          </CardTitle>
                        </div>
                      </div>
                      <div className='w-[150px] md:w-[200px]'>
                      {/* Only show progress if today is actually a scheduled feeding day AND there are events AND not completed */}
                      {upcomingLoading ? (
                          <div className="h-8 flex items-center justify-center mb-3">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                          ) : status && status.totalEvents > 0 && !status.isCompleted && isTodayScheduled && !isNewSchedule && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>
                                  {isActiveToday ? 'Today\'s progress' : `Progress for ${feedingDateString}`}
                                </span>
                                <span>{status.completedEvents}/{status.totalEvents}</span>
                              </div>
                              <Progress value={status.completedEvents * 100 / status.totalEvents} className="h-2" />
                            </div>
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
                  <div className=" px-2">
                    <FeedingEvents 
                      scheduleId={schedule.id} 
                      schedule={schedule}
                      onEventsUpdated={refreshStatus} 
                      isNewSchedule={isNewSchedule}
                    />
                  </div>
              </Collapsible>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}