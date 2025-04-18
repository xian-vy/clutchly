'use client';

import { getLocations, createLocation, updateLocation, deleteLocation } from '@/app/api/locations/locations';
import { getRooms } from '@/app/api/locations/rooms';
import { getRacks } from '@/app/api/locations/racks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useResource } from '@/lib/hooks/useResource';
import { Location, NewLocation, Rack, Room } from '@/lib/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Resolver } from 'react-hook-form';

// Define form schema
const locationFormSchema = z.object({
  room_id: z.string().min(1, 'Room is required'),
  rack_id: z.string().min(1, 'Rack is required'),
  shelf_level: z.string().min(1, 'Shelf level is required'),
  position: z.string().min(1, 'Position is required'),
  notes: z.string().nullable().optional(),
  is_available: z.boolean().default(true),
});

// Define the form values type from the schema
type LocationFormValues = z.infer<typeof locationFormSchema>;

export function LocationsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredRacks, setFilteredRacks] = useState<Rack[]>([]);
  
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
  } = useResource<Location, NewLocation>({
    resourceName: 'Location',
    queryKey: ['locations'],
    getResources: getLocations,
    createResource: createLocation,
    updateResource: updateLocation,
    deleteResource: deleteLocation,
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema) as Resolver<LocationFormValues>,
    defaultValues: {
      room_id: '',
      rack_id: '',
      shelf_level: '',
      position: '',
      notes: null,
      is_available: true,
    },
  });
  
  // Get selected room_id
  const selectedRoomId = form.watch('room_id');
  
  // Filter racks when room changes
  useEffect(() => {
    if (!selectedRoomId) {
      setFilteredRacks([]);
      return;
    }
    
    const racksInRoom = racks.filter(rack => rack.room_id === selectedRoomId);
    setFilteredRacks(racksInRoom);
    
    // If current rack doesn't belong to this room, reset it
    const currentRackId = form.getValues('rack_id');
    if (currentRackId && !racksInRoom.some(rack => rack.id === currentRackId)) {
      form.setValue('rack_id', '');
    }
  }, [selectedRoomId, racks, form]);
  
  // Reset form when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      form.reset({
        room_id: selectedLocation.room_id,
        rack_id: selectedLocation.rack_id,
        shelf_level: String(selectedLocation.shelf_level),
        position: String(selectedLocation.position),
        notes: selectedLocation.notes,
        is_available: selectedLocation.is_available,
      });
      
      // Ensure filtered racks includes the rack of the selected location
      if (selectedLocation.room_id && selectedLocation.rack_id) {
        const racksInRoom = racks.filter(rack => rack.room_id === selectedLocation.room_id);
        setFilteredRacks(racksInRoom);
      }
    } else {
      form.reset({
        room_id: '',
        rack_id: '',
        shelf_level: '',
        position: '',
        notes: null,
        is_available: true,
      });
    }
  }, [selectedLocation, form, racks]);

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedLocation(undefined);
    }
  };

  const onSubmit = async (data: LocationFormValues) => {
    // Generate a label from the form data
    const room = rooms.find(r => r.id === data.room_id);
    const rack = racks.find(r => r.id === data.rack_id);
    const roomName = room?.name || 'Unknown Room';
    const rackName = rack?.name || 'Unknown Rack';
    
    const label = `${roomName} > ${rackName} > Level ${data.shelf_level} > Position ${data.position}`;
    
    const locationData: NewLocation = {
      room_id: data.room_id,
      rack_id: data.rack_id,
      shelf_level: data.shelf_level,
      position: data.position,
      label,
      notes: data.notes || null,
      is_available: data.is_available,
    };
    
    const success = selectedLocation
      ? await handleUpdate(locationData)
      : await handleCreate(locationData);
      
    if (success) {
      onDialogChange(false);
    }
  };

  const isLoading = roomsLoading || racksLoading || locationsLoading;
  
  // Get room and rack names for display
  const getRoomAndRackInfo = (location: Location) => {
    const room = rooms.find(r => r.id === location.room_id);
    const rack = racks.find(r => r.id === location.rack_id);
    return {
      roomName: room?.name || 'Unknown Room',
      rackName: rack?.name || 'Unknown Rack',
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Locations</h3>
        <Button 
          onClick={() => onDialogChange(true)}
          size="sm"
          disabled={racks.length === 0}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>
      
      {rooms.length === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
          Please create at least one room and rack before adding locations.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => {
          const { roomName, rackName } = getRoomAndRackInfo(location);
          return (
            <div 
              key={location.id}
              className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${!location.is_available ? 'bg-gray-50' : ''}`}
              onClick={() => {
                setSelectedLocation(location);
                onDialogChange(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className={`h-4 w-4 mr-2 ${location.is_available ? 'text-green-500' : 'text-red-500'}`} />
                  <h4 className="font-medium">
                    Level {location.shelf_level}, Position {location.position}
                  </h4>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${location.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {location.is_available ? 'Available' : 'Occupied'}
                </span>
              </div>
              
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {roomName} &gt; {rackName}
                </p>
                <p className="font-medium text-sm mt-1">{location.label}</p>
                {location.notes && <p className="text-muted-foreground mt-2">{location.notes}</p>}
              </div>
            </div>
          );
        })}
        
        {locations.length === 0 && !isLoading && racks.length > 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No locations found. Click "Add Location" to create your first location.
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent>
          <DialogTitle>
            {selectedLocation ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rack_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rack</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRoomId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedRoomId ? "Select a rack" : "Select a room first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredRacks.map((rack) => (
                          <SelectItem key={rack.id} value={rack.id}>{rack.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shelf_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shelf Level</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1, 2, 3, or Top" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1, 2, 3, or Left" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Mark this location as available for housing reptiles
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Enclosure specifics, heating setup, etc." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedLocation && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => {
                      if (selectedLocation) {
                        handleDelete(selectedLocation.id);
                        onDialogChange(false);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => onDialogChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedLocation ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 