'use client';

import { useState } from 'react';
import { useResource } from '@/lib/hooks/useResource';
import { Room, NewRoom } from '@/lib/types/location';
import { createRoom, deleteRoom, getRooms, updateRoom } from '@/app/api/locations/rooms';
import { RoomsList } from './RoomsList';
import { RoomForm } from './RoomForm';

export function RoomsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    resources: rooms,
    isLoading,
    selectedResource: selectedRoom,
    setSelectedResource: setSelectedRoom,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Room, NewRoom>({
    resourceName: 'Room',
    queryKey: ['rooms'],
    getResources: getRooms,
    createResource: createRoom,
    updateResource: updateRoom,
    deleteResource: deleteRoom,
  });

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedRoom(undefined);
    }
  };

  const onAddRoom = () => {
    setSelectedRoom(undefined);
    onDialogChange(true);
  };

  const onEditRoom = (room: Room) => {
    setSelectedRoom(room);
    onDialogChange(true);
  };

  const onSubmitRoom = async (data: { name: string; notes: string | null }) => {
    const roomData = { ...data, notes: data.notes || null };
    return selectedRoom
      ? await handleUpdate(roomData)
      : await handleCreate(roomData);
  };

  return (
    <>
      <RoomsList 
        rooms={rooms}
        isLoading={isLoading}
        onEditRoom={onEditRoom}
        onAddRoom={onAddRoom}
      />
      
      <RoomForm
        isOpen={isDialogOpen}
        onClose={() => onDialogChange(false)}
        selectedRoom={selectedRoom}
        onSubmit={onSubmitRoom}
        onDelete={handleDelete}
      />
    </>
  );
} 