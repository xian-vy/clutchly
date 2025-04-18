'use client';

import { Rack, Room } from '@/lib/types/location';
import { LayoutGrid, Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CardDescription } from '@/components/ui/card';

interface RacksListProps {
  racks: Rack[];
  rooms: Room[];
  isLoading: boolean;
  onEditRack: (rack: Rack) => void;
  onAddRack: () => void;
}

export function RacksList({ racks, rooms, isLoading, onEditRack, onAddRack }: RacksListProps) {
  // Get room name from id
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Racks</h3>
          <Badge variant="outline" className="ml-2">
            {racks.length} {racks.length === 1 ? 'rack' : 'racks'}
          </Badge>
        </div>
        <Button 
          onClick={onAddRack}
          className="gap-1"
          disabled={rooms.length === 0}
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          Add Rack
        </Button>
      </div>
      
      {rooms.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex gap-2 items-center text-yellow-800">
              <Building2 className="h-5 w-5" />
              <CardTitle className="text-yellow-800 text-base">Room Required</CardTitle>
            </div>
            <CardDescription className="text-yellow-700 mt-2">
              Please create at least one room before adding racks.
            </CardDescription>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && racks.length === 0 && rooms.length > 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">No Racks Yet</CardTitle>
            <CardDescription className="max-w-md mx-auto mb-4">
              Create your first rack to start organizing your enclosures.
            </CardDescription>
            <Button onClick={onAddRack}>
              <LayoutGrid className="h-4 w-4 mr-2" />
              Add Rack
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {racks.map((rack) => (
            <RackCard 
              key={rack.id} 
              rack={rack} 
              roomName={getRoomName(rack.room_id)}
              onEdit={() => onEditRack(rack)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RackCardProps {
  rack: Rack;
  roomName: string;
  onEdit: () => void;
}

function RackCard({ rack, roomName, onEdit }: RackCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" /> 
          {rack.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" /> {roomName}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-y-1 text-sm mt-2">
          <div className="text-muted-foreground">Type:</div>
          <div>{rack.type}</div>
          
          <div className="text-muted-foreground">Size:</div>
          <div>{rack.rows} rows {rack.columns ? `× ${rack.columns} columns` : ''}</div>
        </div>
        {rack.notes && (
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            {rack.notes}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onEdit}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit Rack
        </Button>
      </CardFooter>
    </Card>
  );
} 