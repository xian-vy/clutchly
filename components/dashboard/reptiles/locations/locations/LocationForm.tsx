'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Location, Room, Rack } from '@/lib/types/location';
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

type LocationFormValues = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation?: Location;
  rooms: Room[];
  racks: Rack[];
  onSubmit: (data: LocationFormValues & { label: string }) => Promise<boolean>;
  onDelete?: (id: string) => Promise<void>;
}

export function LocationForm({
  isOpen,
  onClose,
  selectedLocation,
  rooms,
  racks,
  onSubmit,
  onDelete
}: LocationFormProps) {
  const [filteredRacks, setFilteredRacks] = useState<Rack[]>([]);

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

  const handleSubmit = async (data: LocationFormValues) => {
    // Generate a label from the form data
    const room = rooms.find(r => r.id === data.room_id);
    const rack = racks.find(r => r.id === data.rack_id);
    const roomName = room?.name || 'Unknown Room';
    const rackName = rack?.name || 'Unknown Rack';
    
    const label = `${roomName} > ${rackName} > Level ${data.shelf_level} > Position ${data.position}`;
    
    const success = await onSubmit({
      ...data,
      label,
      notes: data.notes || null,
    });
    
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (selectedLocation && onDelete) {
      await onDelete(selectedLocation.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {selectedLocation ? 'Edit Location' : 'Add New Location'}
        </DialogTitle>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              {selectedLocation && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
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
  );
} 