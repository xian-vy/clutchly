'use client';

import { Location, Room, Rack } from '@/lib/types/location';
import { MapPin, Plus, Edit, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface LocationsListProps {
  locations: Location[];
  rooms: Room[];
  racks: Rack[];
  isLoading: boolean;
  onEditLocation: (location: Location) => void;
  onAddLocation: () => void;
  onBulkAddLocations: () => void;
}

export function LocationsList({ 
  locations, 
  rooms, 
  racks, 
  isLoading, 
  onEditLocation, 
  onAddLocation,
  onBulkAddLocations 
}: LocationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Locations</h3>
          <Badge variant="outline" className="ml-2">
            {locations.length} {locations.length === 1 ? 'location' : 'locations'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onBulkAddLocations}
            size="sm"
            variant="outline"
            disabled={racks.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
          <Button 
            onClick={onAddLocation}
            size="sm"
            disabled={racks.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>
      
      {rooms.length === 0 || racks.length === 0 ? (
        <Card className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
          Please create at least one room and rack before adding locations.
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
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
          </div>
          
          <Card className='px-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      {searchTerm || filterAvailable !== null
                        ? "No locations match your filters"
                        : "No locations found. Click 'Add Location' to create your first location."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => {
                    const { roomName, rackName } = getRoomAndRackInfo(location);
                    return (
                      <TableRow key={location.id} className="group">
                        <TableCell className="font-medium max-w-[200px] truncate" title={location.label}>
                          {location.label}
                        </TableCell>
                        <TableCell>{roomName}</TableCell>
                        <TableCell>{rackName}</TableCell>
                        <TableCell>{location.shelf_level}</TableCell>
                        <TableCell>{location.position}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={location.is_available ? "outline" : "destructive"} 
                            className={location.is_available ? "bg-green-100 text-green-800 hover:bg-green-100" : undefined}
                          >
                            {location.is_available ? 'Available' : 'Occupied'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditLocation(location)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
} 