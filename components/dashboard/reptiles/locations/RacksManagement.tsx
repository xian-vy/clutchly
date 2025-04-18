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
import { LayoutGrid, Edit, PlusCircle, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          onClick={() => onDialogChange(true)}
          className="gap-1"
          disabled={rooms.length === 0}
        >
          <PlusCircle className="h-4 w-4" />
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
            <Button onClick={() => onDialogChange(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Rack
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {racks.map((rack) => (
            <Card key={rack.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" /> 
                  {rack.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {getRoomName(rack.room_id)}
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
                  onClick={() => {
                    setSelectedRack(rack);
                    onDialogChange(true);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Rack
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
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
                          placeholder="Leave empty if not applicable"
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            field.onChange(value);
                          }}
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
                        placeholder="Additional information about this rack..." 
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