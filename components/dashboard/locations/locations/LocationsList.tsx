'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Location, Rack, Room } from '@/lib/types/location';
import { Filter, Loader2, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import { ReptileLocationsVisualizer } from './ReptileLocationsVisualizer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationsListProps {
  locations: Location[];
  rooms: Room[];
  racks: Rack[];
  isLoading: boolean;
  onAddLocation: () => void;
  onBulkAddLocations: () => void;
}

export function LocationsList({ 
  locations, 
  rooms, 
  racks, 
  isLoading, 
  onAddLocation,
  onBulkAddLocations 
}: LocationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  
  // Get room and rack names for display
  const getRoomAndRackInfo = (location: Location) => {
    const room = rooms.find(r => r.id === location.room_id);
    const rack = racks.find(r => r.id === location.rack_id);
    return {
      roomName: room?.name || 'Unknown Room',
      rackName: rack?.name || 'Unknown Rack',
    };
  };

  // Filter locations based on search term and availability
  const filteredLocations = locations.filter(location => {
    const { roomName, rackName } = getRoomAndRackInfo(location);
    const searchMatch = 
      location.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `Level ${location.shelf_level}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `Position ${location.position}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const availabilityMatch = filterAvailable === null || location.is_available === filterAvailable;
    
    return searchMatch && availabilityMatch;
  });

  // Filter racks based on selected room
  const filteredRacks = racks.filter(rack => 
    !selectedRoom || rack.room_id === selectedRoom.id
  );

  if (isLoading) {
    return  (
      <div className="flex justify-center items-center h-full"> 
         <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 w-full">    
          <div className="flex gap-2">
              <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterAvailable(null)}>
                        All Locations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterAvailable(true)}>
                        Available Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterAvailable(false)}>
                        Occupied Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={onBulkAddLocations}
                size="sm"
                variant="outline"
                disabled={racks.length === 0}
              >
                Bulk Generate <Plus className="h-4 w-4 " />
              </Button>
              <Button 
                onClick={onAddLocation}
                size="sm"
                disabled={racks.length === 0}
              >
                New <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedRoom?.id}
                onValueChange={(value) => {
                  const room = rooms.find(r => r.id === value);
                  setSelectedRoom(room || null);
                  setSelectedRack(null);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedRack?.id}
                onValueChange={(value) => {
                  const rack = racks.find(r => r.id === value);
                  setSelectedRack(rack || null);
                }}
                disabled={!selectedRoom}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Rack" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRacks.map(rack => (
                    <SelectItem key={rack.id} value={rack.id}>
                      {rack.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Input
                  placeholder="Search enclosures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
      </div>
      
      {rooms.length === 0 || racks.length === 0 ? (
        <Card className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
          Please create at least one room and rack before adding locations.
        </Card>
      ) : (
        <>
          <ReptileLocationsVisualizer
            selectedRoom={selectedRoom}
            selectedRack={selectedRack}
            startLevel={1}
            endLevel={selectedRack?.rows || 1}
            positionsPerLevel={selectedRack?.columns || 1}
            locations={filteredLocations}
          />
        </>
      )}
    </div>
  );
} 