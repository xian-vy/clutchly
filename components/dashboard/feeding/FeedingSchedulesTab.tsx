'use client';

import { createFeedingSchedule, deleteFeedingSchedule, getFeedingSchedules, updateFeedingSchedule } from '@/app/api/feeding/schedule';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { FeedingScheduleWithTargets, NewFeedingSchedule, TargetType } from '@/lib/types/feeding';
import { useState } from 'react';
import { FeedingScheduleForm } from './FeedingScheduleForm';
import { FeedingScheduleList } from './FeedingScheduleList';
import { Button } from '@/components/ui/button';
import { Info, Loader2, Plus } from 'lucide-react';
import { getLocations } from '@/app/api/locations/locations';
import { getRooms } from '@/app/api/locations/rooms';
import { getRacks } from '@/app/api/locations/racks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';



export function FeedingSchedulesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  
  // Update the API functions to handle the new target types
  const createScheduleWithTargetTypes = async (data: NewFeedingSchedule & { targets: { target_type: TargetType, target_id: string }[] }) => {
    try {
      return await createFeedingSchedule(data);
    } catch (error) {
        console.error('Error creating feeding schedule:', error);
        throw error;
    }
  };
  
  const updateScheduleWithTargetTypes = async (id: string, data: NewFeedingSchedule & { targets: { target_type: TargetType, target_id: string }[] }) => {
    return await updateFeedingSchedule(id, data);
  };
  
  // Use the resource hook for CRUD operations
  const {
    resources: schedules,
    isLoading: schedulesLoading,
    selectedResource: selectedSchedule,
    setSelectedResource: setSelectedSchedule,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<FeedingScheduleWithTargets, NewFeedingSchedule & { targets: { target_type: TargetType, target_id: string }[] }>({
    resourceName: 'Feeding Schedule',
    queryKey: ['feeding-schedules'],
    getResources: getFeedingSchedules,
    createResource: createScheduleWithTargetTypes,
    updateResource: updateScheduleWithTargetTypes,
    deleteResource: deleteFeedingSchedule,
  });

  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Query for occupied locations (locations with reptiles)
  const { data: occupiedLocations = [] } = useQuery({
    queryKey: ['occupied-locations'],
    queryFn: async () => {
      const locations = await getLocations();
      // Filter locations to only those that have reptiles assigned
      const occupiedLocationIds = new Set(reptiles
        .filter(r => r.location_id)
        .map(r => r.location_id));
      
      const filteredLocations = locations.filter(l => occupiedLocationIds.has(l.id));
      return filteredLocations;
    },
    enabled: isDialogOpen
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      return occupiedLocations.map(l => ({ id: l.id, label: l.label }));
    },
    enabled: isDialogOpen
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const data = await getRooms();
      return data.map(r => ({ id: r.id, name: r.name }));
    },
    enabled: isDialogOpen
  });

  const { data: racks = [] } = useQuery({
    queryKey: ['racks'],
    queryFn: async () => {
      const data = await getRacks();
      
      // Create a set of rack IDs that have reptiles
      const racksWithReptiles = new Set<string>();
      
      // For each occupied location
      occupiedLocations.forEach(location => {
        if (location.rack_id) {
          racksWithReptiles.add(location.rack_id);
        }
      });
      
      // Filter racks to only those that have reptiles
      const filteredRacks = data.filter(rack => racksWithReptiles.has(rack.id));
      return filteredRacks.map(r => ({ id: r.id, name: r.name, room_id: r.room_id }));
    },
    enabled: isDialogOpen && occupiedLocations.length > 0
  });

  const { data: levels = [] } = useQuery({
    queryKey: ['rack-levels'],
    queryFn: async () => {
      const rackData = await getRacks();
      
      // Create a set of rack-level combinations that have reptiles
      const levelsWithReptiles = new Set<string>();
      
      // For each occupied location
      occupiedLocations.forEach(location => {
        if (location.rack_id && location.shelf_level) {
          levelsWithReptiles.add(`${location.rack_id}-${location.shelf_level}`);
        }
      });
      
      // Create level data only for racks and levels that have reptiles
      const levelData: { rack_id: string; level: number | string }[] = [];
      rackData.forEach(rack => {
        if (rack.rows) {
          for (let i = 1; i <= rack.rows; i++) {
            // Only add levels that have reptiles
            if (levelsWithReptiles.has(`${rack.id}-${i}`)) {
              levelData.push({ rack_id: rack.id, level: i });
            }
          }
        }
      });
      return levelData;
    },
    enabled: isDialogOpen && occupiedLocations.length > 0
  });

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedSchedule(undefined);
    }
  };

  const isLoading = schedulesLoading ;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[250px]'>
        <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg xl:text-xl">Feeding Schedules</CardTitle>
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
              After creating a schedule, you can start feeding from the Feeding tab.
            </AlertDescription>
          </Alert>
          
          <FeedingScheduleList 
            schedules={schedules}
            onEdit={(schedule) => {
              setSelectedSchedule(schedule);
              onDialogChange(true);
            }}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[600px]">
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
            locations={locations}
            rooms={rooms}
            racks={racks}
            levels={levels}
            reptiles={reptiles}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}