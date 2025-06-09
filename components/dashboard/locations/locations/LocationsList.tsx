'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Location, Rack, Room } from '@/lib/types/location';
import { Filter, Loader2, Package } from 'lucide-react';
import { useState } from 'react';
import { ReptileLocationsVisualizer } from './ReptileLocationsVisualizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LocationsListProps {
  locations: Location[];
  rooms: Room[];
  racks: Rack[];
  isLoading: boolean;
  // onAddLocation: () => void;
}

export function LocationsList({ 
  locations, 
  rooms, 
  racks, 
  isLoading, 
  // onAddLocation
}: LocationsListProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(rooms[0]?.id || null);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full"> 
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  const filteredRacks = racks.filter(rack => 
    (!selectedRoom || rack.room_id === selectedRoom) &&
    (!selectedRack || rack.id === selectedRack)
  );

  return (
    <div className="space-y-4">
      {rooms.length === 0 || racks.length === 0 ? (
      <Alert variant="amber">
        <Package className="h-4 w-4" />
        <AlertTitle>No Rooms or Racks Found</AlertTitle>
        <AlertDescription>
          Please add rooms and racks to the system before adding locations.
        </AlertDescription>
      </Alert>
      ) : (
        <Tabs defaultValue={rooms[0]?.id} value={selectedRoom || undefined} onValueChange={setSelectedRoom}>
          <div className="flex justify-between items-center mb-2">
            <TabsList className="justify-start">
              {rooms.map(room => (
                <TabsTrigger key={room.id} value={room.id}>
                  {room.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedRack(null)}>
                  All Racks
                </DropdownMenuItem>
                {filteredRacks.map(rack => (
                  <DropdownMenuItem key={rack.id} onClick={() => setSelectedRack(rack.id)}>
                    {rack.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {rooms.map(room => (
            <TabsContent key={room.id} value={room.id} className=' max-w-[360px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto'>
              <div className="space-y-4">
                {filteredRacks
                  .filter(rack => rack.room_id === room.id)
                  .map(rack => (
                    <ReptileLocationsVisualizer
                      key={rack.id}
                      selectedRoom={room}
                      selectedRack={rack}
                      startLevel={1}
                      endLevel={rack?.rows || 1}
                      positionsPerLevel={rack?.columns || 1}
                      locations={locations}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
} 