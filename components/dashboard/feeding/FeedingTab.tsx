'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getFeedingSchedules } from '@/app/api/feeding/schedule';
import { FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { FeedingEventsList } from './FeedingEventsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { generateFeedingEvents } from '@/app/api/feeding/events';

export function FeedingTab() {
  const [schedules, setSchedules] = useState<FeedingScheduleWithTargets[]>([]);
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingEvents, setIsGeneratingEvents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const data = await getFeedingSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading feeding schedules:', error);
      toast.error('Could not load feeding schedules');
    } finally {
      setIsLoading(false);
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
      <div className="flex flex-wrap gap-1">
        {locationTargets.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {locationTargets.length} Location{locationTargets.length > 1 ? 's' : ''}
          </Badge>
        )}
        {reptileTargets.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {reptileTargets.length} Reptile{reptileTargets.length > 1 ? 's' : ''}
          </Badge>
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {schedules.map((schedule) => (
        <Collapsible
          key={schedule.id}
          open={expandedScheduleIds.has(schedule.id)}
          onOpenChange={() => toggleExpanded(schedule.id)}
          className="border rounded-lg overflow-hidden"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{schedule.name}</CardTitle>
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
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Frequency:</span>
                  <div className="font-medium">{getRecurrenceDisplay(schedule)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Targets:</span>
                  <div>{getTargetsDisplay(schedule)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(schedule.start_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <div className="font-medium">
                    {schedule.end_date ? format(new Date(schedule.end_date), 'MMM d, yyyy') : 'None'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
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
            <div className="p-4 pt-0 bg-muted/20">
              <FeedingEventsList scheduleId={schedule.id} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
} 