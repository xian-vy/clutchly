'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { FeedingEventsList } from './FeedingEventsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronUp, Info, Loader2, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { generateFeedingEvents, getFeedingEvents } from '@/app/api/feeding/events';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ScheduleStatus {
  totalEvents: number;
  completedEvents: number;
  isComplete: boolean;
  percentage: number;
}

export function FeedingTab() {
  const [schedules, setSchedules] = useState<FeedingScheduleWithTargets[]>([]);
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingEvents, setIsGeneratingEvents] = useState<Record<string, boolean>>({});
  const [scheduleStatus, setScheduleStatus] = useState<Record<string, ScheduleStatus>>({});
  const [isStatusLoading, setIsStatusLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const data = await getFeedingSchedules();
      setSchedules(data);
      
      // Initialize status loading state for each schedule
      const initialStatusLoading: Record<string, boolean> = {};
      data.forEach(schedule => {
        initialStatusLoading[schedule.id] = true;
      });
      setIsStatusLoading(initialStatusLoading);
      
      // Load status for each schedule
      await Promise.all(data.map(schedule => loadScheduleStatus(schedule.id)));
    } catch (error) {
      console.error('Error loading feeding schedules:', error);
      toast.error('Could not load feeding schedules');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadScheduleStatus = async (scheduleId: string) => {
    try {
      const events = await getFeedingEvents(scheduleId);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayEvents = events.filter(event => event.scheduled_date === today);
      
      const totalEvents = todayEvents.length;
      const completedEvents = todayEvents.filter(event => event.fed).length;
      const isComplete = totalEvents > 0 && completedEvents === totalEvents;
      const percentage = totalEvents === 0 ? 0 : Math.round((completedEvents / totalEvents) * 100);
      
      setScheduleStatus(prev => ({
        ...prev,
        [scheduleId]: {
          totalEvents,
          completedEvents,
          isComplete,
          percentage
        }
      }));
    } catch (error) {
      console.error(`Error loading status for schedule ${scheduleId}:`, error);
    } finally {
      setIsStatusLoading(prev => ({
        ...prev,
        [scheduleId]: false
      }));
    }
  };

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
      
      // Reload status for this schedule
      await loadScheduleStatus(schedule.id);
      
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

      {incompleteSchedules > 0 && (
        <Alert className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {incompleteSchedules} feeding schedule{incompleteSchedules > 1 ? 's' : ''} that need{incompleteSchedules === 1 ? 's' : ''} to be completed today.
          </AlertDescription>
        </Alert>
      )}

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
                {isStatusLoading[schedule.id] ? (
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
                <FeedingEventsList scheduleId={schedule.id} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
} 