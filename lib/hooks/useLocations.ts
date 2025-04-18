import { getAvailableLocations, getLocationDetails } from '@/app/api/locations/locations';
import { getRooms } from '@/app/api/locations/rooms';
import { getRacks } from '@/app/api/locations/racks';
import { Location, Rack, Room } from '@/lib/types/location';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function useLocations() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // Fetch available locations
  const { 
    data: availableLocations = [], 
    isLoading: isLocationsLoading,
    refetch: refetchLocations
  } = useQuery({
    queryKey: ['availableLocations'],
    queryFn: getAvailableLocations
  });
  
  // Fetch rooms
  const { 
    data: rooms = [], 
    isLoading: isRoomsLoading
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });
  
  // Fetch racks
  const { 
    data: racks = [], 
    isLoading: isRacksLoading
  } = useQuery({
    queryKey: ['racks'],
    queryFn: getRacks
  });
  
  // Fetch location details when a specific location is selected
  const { 
    data: locationDetails,
    isLoading: isLocationDetailsLoading
  } = useQuery({
    queryKey: ['locationDetails', selectedLocationId],
    queryFn: () => selectedLocationId ? getLocationDetails(selectedLocationId) : null,
    enabled: !!selectedLocationId
  });
  
  // Format locations with room and rack names for better display
  const formattedLocations = availableLocations.map((location: Location) => {
    const room = rooms.find((r: Room) => r.id === location.room_id);
    const rack = racks.find((r: Rack) => r.id === location.rack_id);
    
    return {
      ...location,
      roomName: room?.name || 'Unknown Room',
      rackName: rack?.name || 'Unknown Rack',
      displayName: `${room?.name || 'Unknown'} > ${rack?.name || 'Unknown'} > Level ${location.shelf_level} > Position ${location.position}`
    };
  });
  
  const isLoading = isLocationsLoading || isRoomsLoading || isRacksLoading;
  
  return {
    availableLocations: formattedLocations,
    rooms,
    racks,
    isLoading,
    selectedLocationId,
    setSelectedLocationId,
    locationDetails,
    isLocationDetailsLoading,
    refetchLocations
  };
} 