'use client';

import { createRoom, deleteRoom, getRooms, updateRoom } from '@/app/api/locations/rooms';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useResource } from '@/lib/hooks/useResource';
import { NewRoom, Room } from '@/lib/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const roomFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  notes: z.string().nullable(),
});

export function RoomsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    resources: rooms,
    isLoading,
    selectedResource: selectedRoom,
    setSelectedResource: setSelectedRoom,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Room, NewRoom>({
    resourceName: 'Room',
    queryKey: ['rooms'],
    getResources: getRooms,
    createResource: createRoom,
    updateResource: updateRoom,
    deleteResource: deleteRoom,
  });

  const form = useForm<z.infer<typeof roomFormSchema>>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: selectedRoom?.name || '',
      notes: selectedRoom?.notes || null,
    },
  });
  
  // Reset form when selected room changes
  useEffect(() => {
    if (selectedRoom) {
      form.reset({
        name: selectedRoom.name,
        notes: selectedRoom.notes,
      });
    } else {
      form.reset({
        name: '',
        notes: null,
      });
    }
  }, [selectedRoom, form]);

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedRoom(undefined);
      form.reset();
    }
  };

  const onSubmit = async (data: z.infer<typeof roomFormSchema>) => {
    const success = selectedRoom
      ? await handleUpdate({ ...data, notes: data.notes || null })
      : await handleCreate({ ...data, notes: data.notes || null });
      
    if (success) {
      onDialogChange(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Rooms</h3>
        <Button 
          onClick={() => onDialogChange(true)}
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div 
            key={room.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedRoom(room);
              onDialogChange(true);
            }}
          >
            <h4 className="font-medium">{room.name}</h4>
            {room.notes && <p className="text-sm text-muted-foreground mt-2">{room.notes}</p>}
          </div>
        ))}
        
        {rooms.length === 0 && !isLoading && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No rooms found. Click "Add Room" to create your first room.
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent>
          <DialogTitle>
            {selectedRoom ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Main Room, Quarantine, etc." />
                    </FormControl>
                    <FormMessage />
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
                        placeholder="Room details, temperature settings, etc." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedRoom && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => {
                      if (selectedRoom) {
                        handleDelete(selectedRoom.id);
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
                  {selectedRoom ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 