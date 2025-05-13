'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LayoutGrid } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Rack, Room } from '@/lib/types/location';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LocationsVisualizer } from '../locations/LocationsVisualizer';

// Define form schema
const rackFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  room_id: z.string().min(1, 'Room is required'),
  type: z.string().min(1, 'Type is required'),
  rows: z.coerce.number().min(1, 'Must have at least 1 row'),
  columns: z.coerce.number().nullable(),
  notes: z.string().nullable(),
});

type RackFormValues = z.infer<typeof rackFormSchema>;

interface RackFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRack?: Rack;
  rooms: Room[];
  onSubmit: (data: RackFormValues) => Promise<boolean>;
  onDelete?: (id: string) => Promise<void>;
}

export function RackForm({ isOpen, onClose, selectedRack, rooms, onSubmit, onDelete }: RackFormProps) {
  const [activeTab, setActiveTab] = useState<string>("form");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const form = useForm<RackFormValues>({
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
  
  // Get form values for visualization
  const formValues = form.watch();
  
  // Update selected room object when room_id changes
  useEffect(() => {
    if (formValues.room_id) {
      const room = rooms.find(r => r.id === formValues.room_id);
      setSelectedRoom(room || null);
    } else {
      setSelectedRoom(null);
    }
  }, [formValues.room_id, rooms]);
  
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

  const handleSubmit = async (data: RackFormValues) => {
    const rackData = {
      ...data,
      notes: data.notes || null,
      columns: data.columns || null,
    };
    
    const success = await onSubmit(rackData);
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (selectedRack && onDelete) {
      await onDelete(selectedRack.id);
      onClose();
    }
  };

  // Calculate total locations
  const totalLocations = formValues.rows * (formValues.columns || 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-screen-md">
        <DialogTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          {selectedRack ? 'Edit Rack' : 'Add New Rack'}
        </DialogTitle>
        
        <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="form">Rack Details</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedRoom}>Enclosure Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-4 pt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Automatic Enclosure Generation</AlertTitle>
              <AlertDescription>
                When you create or update a rack, enclosures will be automatically generated based on the rack dimensions.
                Use the preview tab to visualize the enclosures that will be created.
              </AlertDescription>
            </Alert>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="room_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className='w-full'>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rows"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rows (Levels)</FormLabel>
                        <FormControl>
                          <Input disabled={!!(selectedRack)} type="number" min="1" {...field} />
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
                            disabled={!!(selectedRack)}
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
                
                <div className="flex justify-between items-center pt-4">
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Will create </span>
                    <span className="font-semibold">{totalLocations}</span>
                    <span className="text-muted-foreground"> enclosures</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedRack && onDelete && (
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
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => selectedRoom && setActiveTab("preview")}
                      disabled={!selectedRoom}>
                      Preview
                    </Button>
                    <Button type="submit">
                      {selectedRack ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 pt-4 max-w-[360px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto">
            <LocationsVisualizer
              selectedRoom={selectedRoom}
              selectedRack={{
                id: selectedRack?.id || 'preview',
                name: formValues.name || 'Preview Rack',
                room_id: formValues.room_id,
                type: formValues.type || 'Preview Type',
                rows: formValues.rows,
                columns: formValues.columns || 1,
                notes: formValues.notes
              }}
              startLevel={1}
              endLevel={formValues.rows}
              positionsPerLevel={formValues.columns || 1}
              isShowingOccupied={false}
            />
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("form")}
              >
                Back to Form
              </Button>
              
              <Button 
                onClick={form.handleSubmit(handleSubmit)}
              >
                {selectedRack ? 'Update Rack' : 'Create Rack'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 