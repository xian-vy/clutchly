'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { FeedingEventWithDetails, FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { FeedingEventsList } from './FeedingEventsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronUp, Info, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { generateFeedingEvents, getFeedingEvents } from '@/app/api/feeding/events';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useResource } from '@/lib/hooks/useResource';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ScheduleStatus {
  totalEvents: number;
  completedEvents: number;
  isComplete: boolean;
  percentage: number;
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
          const today = new Date();
          const todayString = format(today, 'yyyy-MM-dd');
          
          let relevantEvents: FeedingEventWithDetails[] = [];
          
          if (schedule.recurrence === 'daily') {
            // For daily schedules, only use today's events
            relevantEvents = events.filter(event => event.scheduled_date === todayString);
          } else if (schedule.recurrence === 'weekly') {
            // For weekly schedules, find the most recent feeding day in the current week
            const startDate = new Date(schedule.start_date);
            const dayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Find the most recent occurrence of this day of week (including today)
            const currentDayOfWeek = today.getDay();
            const daysToSubtract = (currentDayOfWeek - dayOfWeek + 7) % 7;
            
            const mostRecentFeedingDay = new Date(today);
            mostRecentFeedingDay.setDate(today.getDate() - daysToSubtract);
            const mostRecentFeedingDayString = format(mostRecentFeedingDay, 'yyyy-MM-dd');
            
            // Use events from the most recent feeding day
            relevantEvents = events.filter(event => event.scheduled_date === mostRecentFeedingDayString);
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
            percentage
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

  // Format targets display
  const getTargetsDisplay = (schedule: FeedingScheduleWithTargets) => {
    const locationTargets = schedule.targets.filter(
      (target) => target.target_type === 'location'
    );
    const reptileTargets = schedule.targets.filter(
      (target) => target.target_type === 'reptile'
    );

    return (
      <div className="flex flex-col gap-1 mt-1">
        {locationTargets.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Locations:</div>
            {locationTargets.map((target, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs mr-1 mb-1">
                {target.location_label || "Unknown location"}
              </Badge>
            ))}
          </div>
        )}
        {reptileTargets.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Reptiles:</div>
            {reptileTargets.map((target, idx) => (
              <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                {target.reptile_name || "Unknown reptile"}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Generate feeding events for the next 30 days
  const handleGenerateEvents = async (schedule: FeedingScheduleWithTargets) => {
    setIsGeneratingEvents(prev => ({ ...prev, [schedule.id]: true }));
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd');
      
      await generateFeedingEvents(schedule.id, startDate, endDate);
      toast.success('Feeding events generated for the next 30 days');
      
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
        {schedules.map((schedule) => (
          <Collapsible
            key={schedule.id}
            open={expandedScheduleIds.has(schedule.id)}
            onOpenChange={() => toggleExpanded(schedule.id)}
            className="border rounded-lg overflow-hidden"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-0 px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{schedule.name}</CardTitle>
                      {scheduleStatus[schedule.id] && scheduleStatus[schedule.id].totalEvents > 0 && (
                        <Badge variant={scheduleStatus[schedule.id].isComplete ? "secondary" : "default"} className={`${scheduleStatus[schedule.id].isComplete ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300" : ""}`}>
                          {scheduleStatus[schedule.id].isComplete ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> Completed
                            </span>
                          ) : (
                            <span>{scheduleStatus[schedule.id].completedEvents}/{scheduleStatus[schedule.id].totalEvents} fed</span>
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
              <CardContent className="pb-4 px-6 pt-4">
                {statusLoading ? (
                  <div className="h-8 flex items-center justify-center mb-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : scheduleStatus[schedule.id] && scheduleStatus[schedule.id].totalEvents > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Today's progress</span>
                      <span>{scheduleStatus[schedule.id].percentage}%</span>
                    </div>
                    <Progress value={scheduleStatus[schedule.id].percentage} className="h-2" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <div className="font-medium">{getRecurrenceDisplay(schedule)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(schedule.start_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">End Date:</span>
                    <div className="font-medium">
                      {schedule.end_date ? format(new Date(schedule.end_date), 'MMM d, yyyy') : 'None'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Targets:</span>
                    {getTargetsDisplay(schedule)}
                  </div>
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
              <div className="px-4 pt-0 pb-4 bg-muted/20">
                <FeedingEventsList 
                  scheduleId={schedule.id} 
                  onEventsUpdated={refreshStatus} 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
} 