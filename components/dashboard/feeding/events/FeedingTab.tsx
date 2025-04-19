'use client';

import { generateFeedingEvents, getFeedingEvents } from '@/app/api/feeding/events';
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
import { AlertCircle, Calendar, Check, ChevronDown, ChevronUp, Footprints, Loader2, MapPin, RefreshCw } from 'lucide-react';
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

  const getScheduleStats = (schedule: FeedingScheduleWithTargets) => {
    const status = scheduleStatus[schedule.id];
    if (!status) return { 
      isEmpty: true,
      totalEvents: 0,
      completedEvents: 0, 
      isComplete: false,
      percentage: 0,
      scheduledDate: format(new Date(), 'yyyy-MM-dd')
    };
    
    return {
      isEmpty: false,
      ...status
    };
  };

  const handleGenerateEvents = async (schedule: FeedingScheduleWithTargets) => {
    setIsGeneratingEvents(prev => ({ ...prev, [schedule.id]: true }));
    
    try {
      const nextFeedingDay = getNextFeedingDay(schedule);
      const dateString = format(nextFeedingDay, 'yyyy-MM-dd');
      const newEvents = await generateFeedingEvents(schedule.id, dateString, dateString);
      
      toast.success(`Generated ${newEvents.length} feeding events for ${schedule.name}`);
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['feeding-events'] });
    } catch (error) {
      console.error('Error generating events:', error);
      toast.error('Failed to generate feeding events');
    } finally {
      setIsGeneratingEvents(prev => ({ ...prev, [schedule.id]: false }));
    }
  };

  if (schedulesLoading || statusLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="w-full space-y-6">
        <Alert variant="default" className="bg-muted/50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-sm">
            You don't have any feeding schedules yet. Create a schedule to get started with feeding management.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button onClick={() => {}}>
            Create Feeding Schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Feeding Schedules</h2>
        <Button size="sm" variant="outline" onClick={refreshStatus}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-5">
        {schedules.map(schedule => {
          const stats = getScheduleStats(schedule);
          const nextFeedingDay = getNextFeedingDay(schedule);
          const isExpanded = expandedScheduleIds.has(schedule.id);
          
          let statusDisplay = null;
          
          if (stats.isEmpty) {
            statusDisplay = (
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">No feeding events</div>
                <div className="text-xs text-muted-foreground">
                  Next feeding day: {format(nextFeedingDay, 'EEEE, MMM d')}
                </div>
              </div>
            );
          } else {
            statusDisplay = (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <span className={stats.isComplete ? "text-green-600" : "text-amber-600"}>
                    {stats.completedEvents}/{stats.totalEvents} completed
                  </span>
                  {stats.isComplete && <Check className="h-4 w-4 text-green-600" />}
                </div>
                <div className="w-full">
                  <Progress 
                    value={stats.percentage}
                    className="bg-muted"
                  />
                  <div className={`h-2 rounded-full mt-[-8px] ${stats.isComplete ? "bg-green-600" : "bg-amber-600"}`} style={{ width: `${stats.percentage}%` }}></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {isToday(new Date(stats.scheduledDate)) 
                    ? "Today" 
                    : format(new Date(stats.scheduledDate), 'EEEE, MMM d')}
                </div>
              </div>
            );
          }
          
          return (
            <Card key={schedule.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{schedule.name}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                      <Badge variant="outline" className="flex gap-1 items-center">
                        <Calendar className="h-3 w-3" />
                        {getRecurrenceDisplay(schedule)}
                      </Badge>
                      
                      {schedule.targets.map(target => (
                        <Badge 
                          key={target.id} 
                          variant="secondary" 
                          className="flex gap-1 items-center"
                        >
                          {target.target_type === 'reptile' 
                            ? <Footprints className="h-3 w-3" /> 
                            : <MapPin className="h-3 w-3" />}
                          {target.target_type === 'reptile' ? target.reptile_name : target.location_label}
                        </Badge>
                      ))}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateEvents(schedule);
                            }}
                            disabled={isGeneratingEvents[schedule.id]}
                          >
                            {isGeneratingEvents[schedule.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate feeding events</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                {statusDisplay}
              </CardContent>
              
              <CardFooter className="pt-0 flex-col items-start">
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(schedule.id)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex w-full justify-center">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <FeedingEventsList 
                      scheduleId={schedule.id} 
                      date={stats.scheduledDate} 
                      onStatusChange={refreshStatus}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 