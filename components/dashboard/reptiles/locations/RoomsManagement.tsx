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
import { Building2, Edit, PlusCircle, LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          onClick={() => onDialogChange(true)}
          className="gap-1"
        >
          <PlusCircle className="h-4 w-4" />
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
            <CardDescription className="max-w-md mx-auto mb-4">
              Create your first room to start organizing your reptile housing setup.
            </CardDescription>
            <Button onClick={() => onDialogChange(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                  onClick={() => {
                    setSelectedRoom(room);
                    onDialogChange(true);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Room
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
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