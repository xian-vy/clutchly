'use client';

import { useState } from 'react';
import { Location, NewLocation } from '@/lib/types/location';
import { getRooms } from '@/app/api/locations/rooms';
import { getRacks } from '@/app/api/locations/racks';
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/app/api/locations/locations';
import { LocationsList } from './LocationsList';
import { LocationForm } from './LocationForm';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export function LocationsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);

  // Get locations, rooms, and racks
  const { 
    data: locations = [], 
    isLoading,
    refetch: refetchLocations
  } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });
  
  const { 
    data: rooms = [], 
    isLoading: isRoomsLoading 
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });
  
  const { 
    data: racks = [], 
    isLoading: isRacksLoading 
  } = useQuery({
    queryKey: ['racks'],
    queryFn: getRacks
  });

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedLocation(undefined);
    }
  };

  const onAddLocation = () => {
    setSelectedLocation(undefined);
    setIsDialogOpen(true);
  };

  const onSubmitLocation = async (data: NewLocation) => {
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, data);
      } else {
        await createLocation(data);
      }
      refetchLocations();
      return true;
    } catch (error) {
      console.error('Error saving location:', error);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      refetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  if (isLoading || isRoomsLoading || isRacksLoading) {
    return (
      <div className="flex justify-center items-center h-full"> 
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <LocationsList 
        locations={locations}
        rooms={rooms}
        racks={racks}
        isLoading={isLoading}
        onAddLocation={onAddLocation}
      />
      
      <LocationForm
        isOpen={isDialogOpen}
        onClose={() => onDialogChange(false)}
        selectedLocation={selectedLocation}
        rooms={rooms}
        racks={racks}
        onSubmit={onSubmitLocation}
        onDelete={handleDelete}
      />
    </>
  );
} 