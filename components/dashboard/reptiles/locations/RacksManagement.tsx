'use client';

import { getRooms } from '@/app/api/locations/rooms';
import { createRack, deleteRack, getRacks, updateRack } from '@/app/api/locations/racks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useResource } from '@/lib/hooks/useResource';
import { NewRack, Rack, Room } from '@/lib/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const rackFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  room_id: z.string().min(1, 'Room is required'),
  type: z.string().min(1, 'Type is required'),
  rows: z.coerce.number().min(1, 'Must have at least 1 row'),
  columns: z.coerce.number().nullable(),
  notes: z.string().nullable(),
});

export function RacksManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  
  // Manage racks
  const {
    resources: racks,
    isLoading: racksLoading,
    selectedResource: selectedRack,
    setSelectedResource: setSelectedRack,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Rack, NewRack>({
    resourceName: 'Rack',
    queryKey: ['racks'],
    getResources: getRacks,
    createResource: createRack,
    updateResource: updateRack,
    deleteResource: deleteRack,
  });

  const form = useForm<z.infer<typeof rackFormSchema>>({
    resolver: zodResolver(rackFormSchema),
    defaultValues: {
      name: '',
      room_id: '',
      type: '',
      rows: 1,
      columns: null,
      notes: null,
    },
  });
  
  // Reset form when selected rack changes
  useEffect(() => {
    if (selectedRack) {
      form.reset({
        name: selectedRack.name,
        room_id: selectedRack.room_id,
        type: selectedRack.type,
        rows: selectedRack.rows,
        columns: selectedRack.columns,
        notes: selectedRack.notes,
      });
    } else {
      form.reset({
        name: '',
        room_id: '',
        type: '',
        rows: 1,
        columns: null,
        notes: null,
      });
    }
  }, [selectedRack, form]);

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedRack(undefined);
    }
  };

  const onSubmit = async (data: z.infer<typeof rackFormSchema>) => {
    const success = selectedRack
      ? await handleUpdate({
          ...data,
          notes: data.notes || null,
          columns: data.columns || null,
        })
      : await handleCreate({
          ...data,
          notes: data.notes || null,
          columns: data.columns || null,
        });
      
    if (success) {
      onDialogChange(false);
    }
  };

  const isLoading = roomsLoading || racksLoading;
  
  // Get room names for display
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Racks</h3>
        <Button 
          onClick={() => onDialogChange(true)}
          size="sm"
          disabled={rooms.length === 0}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Rack
        </Button>
      </div>
      
      {rooms.length === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
          Please create at least one room before adding racks.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {racks.map((rack) => (
          <div 
            key={rack.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedRack(rack);
              onDialogChange(true);
            }}
          >
            <h4 className="font-medium">{rack.name}</h4>
            <div className="mt-1 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Room:</span> {getRoomName(rack.room_id)}</p>
              <p><span className="text-muted-foreground">Type:</span> {rack.type}</p>
              <p><span className="text-muted-foreground">Size:</span> {rack.rows} rows {rack.columns ? `× ${rack.columns} columns` : ''}</p>
              {rack.notes && <p className="text-muted-foreground mt-2">{rack.notes}</p>}
            </div>
          </div>
        ))}
        
        {racks.length === 0 && !isLoading && rooms.length > 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No racks found. Click "Add Rack" to create your first rack.
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent>
          <DialogTitle>
            {selectedRack ? 'Edit Rack' : 'Add New Rack'}
          </DialogTitle>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rack Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Rack A, Display Wall, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rack Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., CB70, Freedom Breeder, PVC Cage, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rows"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rows (Levels)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="columns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Columns (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
                        placeholder="Rack setup details, heating, etc." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedRack && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => {
                      if (selectedRack) {
                        handleDelete(selectedRack.id);
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
                  {selectedRack ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 