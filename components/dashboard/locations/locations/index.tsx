'use client';

import { useState } from 'react';
import { useResource } from '@/lib/hooks/useResource';
import { Room, Rack, Location, NewLocation } from '@/lib/types/location';
import { getRooms } from '@/app/api/locations/rooms';
import { getRacks } from '@/app/api/locations/racks';
import { getLocations, createLocation, updateLocation, deleteLocation, bulkCreateLocations } from '@/app/api/locations/locations';
import { LocationsList } from './LocationsList';
import { LocationForm } from './LocationForm';
import { toast } from 'sonner';
import { BulkLocationForm } from './BulkLocationForm';

export function LocationsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isGeneratingLocations, setIsGeneratingLocations] = useState(false);
  
  // Fetch rooms for the dropdown
  const {
    resources: rooms,
    isLoading: roomsLoading,
  } = useResource<Room, any>({
    resourceName: 'Room',
    queryKey: ['rooms'],
    getResources: getRooms,
    createResource: async () => { throw new Error('Not implemented') },
    updateResource: async () => { throw new Error('Not implemented') },
    deleteResource: async () => { throw new Error('Not implemented') },
  });
  
  // Fetch racks for the dropdown
  const {
    resources: racks,
    isLoading: racksLoading,
  } = useResource<Rack, any>({
    resourceName: 'Rack',
    queryKey: ['racks'],
    getResources: getRacks,
    createResource: async () => { throw new Error('Not implemented') },
    updateResource: async () => { throw new Error('Not implemented') },
    deleteResource: async () => { throw new Error('Not implemented') },
  });
  
  // Manage locations
  const {
    resources: locations,
    isLoading: locationsLoading,
    selectedResource: selectedLocation,
    setSelectedResource: setSelectedLocation,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch,
  } = useResource<Location, NewLocation>({
    resourceName: 'Location',
    queryKey: ['locations'],
    getResources: getLocations,
    createResource: createLocation,
    updateResource: updateLocation,
    deleteResource: deleteLocation,
  });

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedLocation(undefined);
    }
  };

  const onBulkDialogChange = (open: boolean) => {
    setIsBulkDialogOpen(open);
  };

  const onAddLocation = () => {
    setSelectedLocation(undefined);
    onDialogChange(true);
  };

  const onEditLocation = (location: Location) => {
    setSelectedLocation(location);
    onDialogChange(true);
  };

  const onSubmitLocation = async (data: NewLocation) => {
    return selectedLocation
      ? await handleUpdate(data)
      : await handleCreate(data);
  };

  const onSubmitBulkLocations = async (locationsToCreate: NewLocation[]) => {
    setIsGeneratingLocations(true);
    
    try {
      // Create all locations at once
      await bulkCreateLocations(locationsToCreate);
      
      // Success message
      const totalLocations = locationsToCreate.length;
      toast.success(`Successfully created ${totalLocations} locations`);
      
      // Refresh locations using refetch
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error creating bulk locations:", error);
      toast.error("Failed to create locations");
      return false;
    } finally {
      setIsGeneratingLocations(false);
    }
  };

  const isLoading = roomsLoading || racksLoading || locationsLoading;

  return (
    <>
      <LocationsList 
        locations={locations}
        rooms={rooms}
        racks={racks}
        isLoading={isLoading}
        onEditLocation={onEditLocation}
        onAddLocation={onAddLocation}
        onBulkAddLocations={() => setIsBulkDialogOpen(true)}
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
      
      <BulkLocationForm
        isOpen={isBulkDialogOpen}
        onClose={() => onBulkDialogChange(false)}
        rooms={rooms}
        racks={racks}
        isLoading={isGeneratingLocations}
        onSubmit={onSubmitBulkLocations}
      />
    </>
  );
} 