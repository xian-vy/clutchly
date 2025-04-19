'use client';

import { createFeedingSchedule, deleteFeedingSchedule, getFeedingSchedules, updateFeedingSchedule } from '@/app/api/feeding/schedule';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { FeedingScheduleWithTargets, NewFeedingSchedule } from '@/lib/types/feeding';
import { useState } from 'react';
import { FeedingScheduleForm } from './FeedingScheduleForm';
import { FeedingScheduleList } from './FeedingScheduleList';
import { Button } from '@/components/ui/button';
import { Info, Loader2, Plus } from 'lucide-react';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { getLocations } from '@/app/api/locations/locations';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FeedingSchedulesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const isLoading = schedulesLoading || isLoadingOptions;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[250px]'>
        <Loader2 className='w-6 h-6 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Feeding Schedules</CardTitle>
            <Button 
              onClick={() => onDialogChange(true)}
              className="flex items-center gap-1"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Schedule
            </Button>
          </div>
          <CardDescription className="text-sm">
            Create and manage feeding schedules for your reptiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert variant="default" className="bg-muted/50 border-muted mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Create schedules based on specific locations or reptiles with customizable recurrence patterns. 
              After creating a schedule, you can generate feeding events from the Feeding tab.
            </AlertDescription>
          </Alert>
          
          <FeedingScheduleList 
            schedules={schedules}
            onEdit={(schedule) => {
              setSelectedSchedule(schedule);
              onDialogChange(true);
            }}
            onDelete={handleDelete}
            onAddNew={() => onDialogChange(true)}
          />
        </CardContent>
      </Card>

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