'use client';

import { useState } from 'react';
import { useResource } from '@/lib/hooks/useResource';
import { Room, Rack, NewRack, NewRoom } from '@/lib/types/location';
import { getRooms } from '@/app/api/locations/rooms';
import { createRack, deleteRack, getRacks, updateRack } from '@/app/api/locations/racks';
import { RacksList } from './RacksList';
import { RackForm } from './RackForm';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

export function RacksManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch rooms for the dropdown
  const {
    resources: rooms,
    isLoading: roomsLoading,
  } = useResource<Room, NewRoom>({
    resourceName: 'Room',
    queryKey: [CACHE_KEYS.ROOMS],
    getResources: getRooms,
    createResource: async () => { throw new Error('Not implemented') },
    updateResource: async () => { throw new Error('Not implemented') },
    deleteResource: async () => { throw new Error('Not implemented') },
  });
  
  // Manage racks
  const {
    resources: racks,
    isLoading: racksLoading,
    selectedResource: selectedRack,
    setSelectedResource: setSelectedRack,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Rack, NewRack>({
    resourceName: 'Rack',
    queryKey: [CACHE_KEYS.RACKS],
    getResources: getRacks,
    createResource: createRack,
    updateResource: updateRack,
    deleteResource: deleteRack,
  });

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedRack(undefined);
    }
  };

  const onAddRack = () => {
    setSelectedRack(undefined);
    onDialogChange(true);
  };

  const onEditRack = (rack: Rack) => {
    setSelectedRack(rack);
    onDialogChange(true);
  };

  const onSubmitRack = async (data: {
    name: string;
    room_id: string;
    type: string;
    rows: number;
    columns: number | null;
    notes: string | null;
  }) => {
    return selectedRack
      ? await handleUpdate(data)
      : await handleCreate(data);
  };

  const isLoading = roomsLoading || racksLoading;

  return (
    <>
      <RacksList 
        racks={racks}
        rooms={rooms}
        isLoading={isLoading}
        onEditRack={onEditRack}
        onAddRack={onAddRack}
      />
      
      <RackForm
        isOpen={isDialogOpen}
        onClose={() => onDialogChange(false)}
        selectedRack={selectedRack}
        rooms={rooms}
        onSubmit={onSubmitRack}
        onDelete={handleDelete}
      />
    </>
  );
} 