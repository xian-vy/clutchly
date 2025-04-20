'use client';

import { generateEventsFromSchedule, getFeedingEvents } from '@/app/api/feeding/events';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useResource } from '@/lib/hooks/useResource';
import { FeedingEventWithDetails, FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday, startOfDay } from 'date-fns';
import { AlertCircle, Calendar, Check, ChevronDown, ChevronUp, Info, Loader2, MapPin, RefreshCw, Turtle } from 'lucide-react';
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
  const [isGeneratingEvents, setIsGeneratingEvents] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  // Use the resource hook for schedules
  const {
    resources: schedules,
    isLoading: schedulesLoading,
    refetch: refetchSchedules,
  } = useResource<FeedingScheduleWithTargets, any>({
    resourceName: 'Feeding Schedule',
    queryKey: ['feeding-schedules'],
    getResources: getFeedingSchedules,
    createResource: async () => { return null as any; },
    updateResource: async () => { return null as any; },
    deleteResource: async () => {},
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
          
          const totalEvents = relevantEvents.length;
          const completedEvents = relevantEvents.filter(event => event.fed).length;
          const isComplete = totalEvents > 0 && completedEvents === totalEvents;
          const percentage = totalEvents === 0 ? 0 : Math.round((completedEvents / totalEvents) * 100);
          
          statuses[schedule.id] = {
            totalEvents,
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
  const getScheduleStats = (schedule: FeedingScheduleWithTargets) => {
    // Count location-related targets (location, room, rack, level)
    const locationRelatedTargets = schedule.targets.filter(
      (target) => ['location', 'room', 'rack', 'level'].includes(target.target_type)
    );
    
    // Count direct reptile targets
    const reptileTargets = schedule.targets.filter(
      (target) => target.target_type === 'reptile'
    );
    
    // For room, rack, and level targets, we'd need to estimate the number of reptiles
    // Since we don't have the exact count, let's make a reasonable estimate
    // based on the number of targets
    let estimatedReptileCount = reptileTargets.length;
    
    // Add estimated reptiles from location-related targets
    // A conservative estimate might be at least 1 reptile per location-related target
    const locationBasedReptileEstimate = locationRelatedTargets.length > 0 ? locationRelatedTargets.length : 0;
    estimatedReptileCount += locationBasedReptileEstimate;
    
    // Calculate next feeding date
    const nextFeedingDate = getNextFeedingDay(schedule);
    
    return {
      locationCount: locationRelatedTargets.length,
      reptileCount: estimatedReptileCount,
      nextFeedingDate
    };
  };

  // Generate feeding events for the next 30 days
  const handleGenerateEvents = async (schedule: FeedingScheduleWithTargets) => {
    setIsGeneratingEvents(prev => ({ ...prev, [schedule.id]: true }));
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd');
      
      // Generate events using the proper function
      const result = await generateEventsFromSchedule(schedule.id, startDate, endDate);
      toast.success(`${result.count} feeding events generated for the next 30 days`);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['feeding-events'] });
      queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
      
      // If schedule is expanded, we want to refresh its events
      if (expandedScheduleIds.has(schedule.id)) {
        toggleExpanded(schedule.id);
        setTimeout(() => toggleExpanded(schedule.id), 300);
      }
    } catch (error) {
      console.error('Error generating events:', error);
      toast.error('Failed to generate feeding events');
    } finally {
      setIsGeneratingEvents(prev => ({ ...prev, [schedule.id]: false }));
    }
  };

  const isLoading = schedulesLoading || statusLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    .filter(([_, status]) => status.totalEvents > 0 && !status.isComplete)
    .length;

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          View and manage your feeding schedules. Click on a schedule to expand and see upcoming feeding events. 
          Generate feeding events for the next 30 days with the button at the bottom of each card.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        {incompleteSchedules > 0 ? (
          <Alert className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 flex-1 mr-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {incompleteSchedules} feeding schedule{incompleteSchedules > 1 ? 's' : ''} that need{incompleteSchedules === 1 ? 's' : ''} to be completed today.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex-1" />
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshStatus} 
          className="h-9 flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.map((schedule) => {
          const stats = getScheduleStats(schedule);
          const status = scheduleStatus[schedule.id];
          const isActiveToday = status?.scheduledDate === format(new Date(), 'yyyy-MM-dd');
          const nextFeedingFormatted = format(stats.nextFeedingDate, 'MMM d, yyyy');
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
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-0 px-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{schedule.name}</CardTitle>
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
                      {schedule.description && (
                        <CardDescription className="mt-1">{schedule.description}</CardDescription>
                      )}
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedScheduleIds.has(schedule.id) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 px-6 pt-3">
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
                  
                  <div className="bg-muted/20 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{getRecurrenceDisplay(schedule)}</div>
                          <div className="text-xs text-muted-foreground">
                            {isToday(stats.nextFeedingDate) 
                              ? 'Feeding today' 
                              : `Next: ${nextFeedingFormatted}`
                            }
                          </div>
                        </div>
                      </div>
                    
                      <div className="flex items-start gap-1.5">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div className="font-medium">{stats.locationCount} location{stats.locationCount !== 1 ? 's' : ''}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Turtle className="h-4 w-4 text-muted-foreground" />
                            <div className="font-medium">{stats.reptileCount} reptile{stats.reptileCount !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">Targets:</div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {schedule.targets
                      .filter(target => ['location', 'room', 'rack', 'level'].includes(target.target_type))
                      .map((target, index) => {
                        let label = "Unknown location";
                        let tooltipContent = "Location";
                        
                        if (target.target_type === 'location' && target.location_label) {
                          label = target.location_label;
                          tooltipContent = `Location: ${target.location_label}`;
                        }
                        else if (target.target_type === 'room' && target.room_name) {
                          label = `Room: ${target.room_name}`;
                          tooltipContent = `Room: ${target.room_name}`;
                        }
                        else if (target.target_type === 'rack' && target.rack_name) {
                          label = `Rack: ${target.rack_name}`;
                          tooltipContent = `Rack: ${target.rack_name}`;
                        }
                        else if (target.target_type === 'level' && target.rack_name && target.level_number) {
                          label = `Level: ${target.level_number}`;
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
                  <div className="flex flex-wrap gap-1">
                    {schedule.targets
                      .filter(target => target.target_type === 'reptile')
                      .map((target, index) => (
                        <TooltipProvider key={`rep-${index}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs">
                                {target.reptile_name || "Unknown reptile"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reptile: {target.reptile_name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateEvents(schedule)}
                    disabled={isGeneratingEvents[schedule.id]}
                  >
                    {isGeneratingEvents[schedule.id] && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Generate Feeding Events
                  </Button>
                </CardFooter>
              </Card>
              <CollapsibleContent>
                <div className="mt-2">
                  <FeedingEventsList 
                    scheduleId={schedule.id} 
                    schedule={schedule}
                    onEventsUpdated={refreshStatus} 
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
} 