'use client';

import { createFeedingSchedule, deleteFeedingSchedule, getFeedingSchedules, updateFeedingSchedule } from '@/app/api/feeding/schedule';
import { generateFeedingEvents, getFeedingEvents } from '@/app/api/feeding/events';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { FeedingScheduleWithTargets, NewFeedingSchedule } from '@/lib/types/feeding';
import { useState } from 'react';
import { FeedingScheduleForm } from './FeedingScheduleForm';
import { FeedingScheduleList } from './FeedingScheduleList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { getLocations } from '@/app/api/locations/locations';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { FeedingEventsList } from './FeedingEventsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function FeedingSchedulesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneratingEvents, setIsGeneratingEvents] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<FeedingScheduleWithTargets | null>(null);
  const [reptiles, setReptiles] = useState<{ id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: string; label: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // Use the resource hook for CRUD operations
  const {
    resources: schedules,
    isLoading: schedulesLoading,
    selectedResource: selectedSchedule,
    setSelectedResource: setSelectedSchedule,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch: refetchSchedules
  } = useResource<FeedingScheduleWithTargets, NewFeedingSchedule & { targets: { target_type: 'reptile' | 'location', target_id: string }[] }>({
    resourceName: 'Feeding Schedule',
    queryKey: ['feeding-schedules'],
    getResources: getFeedingSchedules,
    createResource: createFeedingSchedule,
    updateResource: updateFeedingSchedule,
    deleteResource: deleteFeedingSchedule,
  });

  // Load reptiles and locations when dialog opens
  const loadOptions = async () => {
    if (reptiles.length > 0 && locations.length > 0) return;
    
    setIsLoadingOptions(true);
    try {
      const [reptileData, locationData] = await Promise.all([
        getReptiles(),
        getLocations()
      ]);
      
      setReptiles(reptileData.map(r => ({ id: r.id, name: r.name })));
      setLocations(locationData.map(l => ({ id: l.id, label: l.label })));
    } catch (error) {
      console.error('Error loading options:', error);
      toast.error('Failed to load reptiles and locations');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedSchedule(undefined);
    } else {
      loadOptions();
    }
  };

  // Generate feeding events for the next 30 days
  const handleGenerateEvents = async (schedule: FeedingScheduleWithTargets) => {
    setIsGeneratingEvents(true);
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      
      await generateFeedingEvents(schedule.id, startDate, endDate);
      toast.success('Feeding events generated for the next 30 days');
      
      // If currently viewing this schedule, refresh events
      if (viewingSchedule?.id === schedule.id) {
        setViewingSchedule(schedule);
      }
    } catch (error) {
      console.error('Error generating events:', error);
      toast.error('Failed to generate feeding events');
    } finally {
      setIsGeneratingEvents(false);
    }
  };

  const isLoading = schedulesLoading || isLoadingOptions;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[250px]'>
        <Loader2 className='w-6 h-6 animate-spin text-primary' />
      </div>
    );
  }

  // If viewing a specific schedule's events
  if (viewingSchedule) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setViewingSchedule(null)}
                className="mb-1 p-0 hover:bg-transparent"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Schedules
              </Button>
              <CardTitle className="text-xl font-semibold">{viewingSchedule.name}</CardTitle>
              {viewingSchedule.description && (
                <CardDescription className="mt-1">{viewingSchedule.description}</CardDescription>
              )}
            </div>
            <Button
              onClick={() => handleGenerateEvents(viewingSchedule)}
              disabled={isGeneratingEvents}
              size="sm"
            >
              {isGeneratingEvents && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Generate Events
            </Button>
          </CardHeader>
        </Card>
        
        <FeedingEventsList scheduleId={viewingSchedule.id} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">
          Create feeding schedules based on locations or specific reptiles with customizable recurrence patterns.
        </p>
        <Button 
          onClick={() => onDialogChange(true)}
          className="flex items-center gap-1"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>
      
      <FeedingScheduleList 
        schedules={schedules}
        onEdit={(schedule) => {
          setSelectedSchedule(schedule);
          onDialogChange(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => onDialogChange(true)}
        onViewEvents={setViewingSchedule}
      />

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle>
            {selectedSchedule ? 'Edit Feeding Schedule' : 'Create Feeding Schedule'}
          </DialogTitle>
          <FeedingScheduleForm
            initialData={selectedSchedule}
            onSubmit={async (data) => {
              const success = selectedSchedule
                ? await handleUpdate(data)
                : await handleCreate(data);
              
              if (success) {
                onDialogChange(false);
              }
            }}
            onCancel={() => onDialogChange(false)}
            reptiles={reptiles}
            locations={locations}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 