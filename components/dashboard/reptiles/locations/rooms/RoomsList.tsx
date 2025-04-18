'use client';

import { Room } from '@/lib/types/location';
import { Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoomsListProps {
  rooms: Room[];
  isLoading: boolean;
  onEditRoom: (room: Room) => void;
  onAddRoom: () => void;
}

export function RoomsList({ rooms, isLoading, onEditRoom, onAddRoom }: RoomsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Rooms</h3>
          <Badge variant="outline" className="ml-2">
            {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
          </Badge>
        </div>
        <Button 
          onClick={onAddRoom}
          className="gap-1"
        >
          <Building2 className="h-4 w-4 mr-1" />
          Add Room
        </Button>
      </div>
      
      {!isLoading && rooms.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">No Rooms Yet</CardTitle>
            <p className="max-w-md mx-auto mb-4 text-muted-foreground">
              Create your first room to start organizing your reptile housing setup.
            </p>
            <Button onClick={onAddRoom}>
              <Building2 className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onEdit={() => onEditRoom(room)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface RoomCardProps {
  room: Room;
  onEdit: () => void;
}

function RoomCard({ room, onEdit }: RoomCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          {room.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {room.notes ? (
          <p className="text-sm text-muted-foreground">{room.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No notes</p>
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
          Edit Room
        </Button>
      </CardFooter>
    </Card>
  );
} 