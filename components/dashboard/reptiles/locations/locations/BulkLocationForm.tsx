'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Room, Rack, NewLocation } from '@/lib/types/location';
import { Resolver } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationsVisualizer } from './LocationsVisualizer';

// Define form schema for bulk location creator
const bulkLocationFormSchema = z.object({
  room_id: z.string().min(1, 'Room is required'),
  rack_id: z.string().min(1, 'Rack is required'),
  start_level: z.coerce.number().min(1, 'Start level must be at least 1'),
  end_level: z.coerce.number().min(1, 'End level must be at least 1'),
  positions_per_level: z.coerce.number().min(1, 'Must have at least 1 position per level'),
  notes: z.string().nullable().optional(),
  is_available: z.boolean().default(true),
});

type BulkLocationFormValues = z.infer<typeof bulkLocationFormSchema>;

interface BulkLocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  racks: Rack[];
  isLoading: boolean;
  onSubmit: (locations: NewLocation[]) => Promise<boolean>;
}

export function BulkLocationForm({
  isOpen,
  onClose,
  rooms,
  racks,
  isLoading,
  onSubmit
}: BulkLocationFormProps) {
  const [filteredRacks, setFilteredRacks] = useState<Rack[]>([]);
  const [activeTab, setActiveTab] = useState<string>("form");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);

  const form = useForm<BulkLocationFormValues>({
    resolver: zodResolver(bulkLocationFormSchema) as Resolver<BulkLocationFormValues>,
    defaultValues: {
      room_id: '',
      rack_id: '',
      start_level: 1,
      end_level: 3,
      positions_per_level: 4,
      notes: null,
      is_available: true,
    },
  });
  
  // Get form values for visualization
  const formValues = form.watch();
  
  // Get selected room_id for bulk form
  const bulkSelectedRoomId = form.watch('room_id');
  const bulkSelectedRackId = form.watch('rack_id');
  
  // Update selected room and rack objects
  useEffect(() => {
    if (bulkSelectedRoomId) {
      const room = rooms.find(r => r.id === bulkSelectedRoomId);
      setSelectedRoom(room || null);
    } else {
      setSelectedRoom(null);
    }
  }, [bulkSelectedRoomId, rooms]);
  
  useEffect(() => {
    if (bulkSelectedRackId) {
      const rack = racks.find(r => r.id === bulkSelectedRackId);
      setSelectedRack(rack || null);
    } else {
      setSelectedRack(null);
    }
  }, [bulkSelectedRackId, racks]);
  
  // Filter racks when room changes in bulk form
  useEffect(() => {
    if (!bulkSelectedRoomId) {
      setFilteredRacks([]);
      return;
    }
    
    const racksInRoom = racks.filter(rack => rack.room_id === bulkSelectedRoomId);
    setFilteredRacks(racksInRoom);
    
    // If current rack doesn't belong to this room, reset it
    const currentRackId = form.getValues('rack_id');
    if (currentRackId && !racksInRoom.some(rack => rack.id === currentRackId)) {
      form.setValue('rack_id', '');
    }
  }, [bulkSelectedRoomId, racks, form]);

  // Calculate total locations
  const totalLocations = 
    formValues.start_level && formValues.end_level && formValues.positions_per_level
      ? (formValues.end_level - formValues.start_level + 1) * formValues.positions_per_level
      : 0;

  const handleSubmit = async (data: BulkLocationFormValues) => {
    // Validate input
    if (data.end_level < data.start_level) {
      form.setError("end_level", { 
        type: "manual", 
        message: "End level must be greater than or equal to start level" 
      });
      return false;
    }
    
    // Generate locations in bulk
    const locationsToCreate: NewLocation[] = [];
    const room = rooms.find(r => r.id === data.room_id);
    const rack = racks.find(r => r.id === data.rack_id);
    const roomName = room?.name || 'Unknown Room';
    const rackName = rack?.name || 'Unknown Rack';
    
    // For each level in the range
    for (let level = data.start_level; level <= data.end_level; level++) {
      // For each position in the level
      for (let position = 1; position <= data.positions_per_level; position++) {
        const label = `${roomName} > ${rackName} > Level ${level} > Position ${position}`;
        
        locationsToCreate.push({
          room_id: data.room_id,
          rack_id: data.rack_id,
          shelf_level: level.toString(),
          position: position.toString(),
          label,
          notes: data.notes || null,
          is_available: data.is_available,
        });
      }
    }
    
    const success = await onSubmit(locationsToCreate);
    if (success) {
      onClose();
    }
    
    return success;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Generate Multiple Locations
        </DialogTitle>
        
        <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Bulk Generator</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedRoom || !selectedRack}>Location Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-4 pt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bulk Creation</AlertTitle>
              <AlertDescription>
                This will create multiple locations at once based on the configuration below.
                Use the preview tab to visualize the locations that will be created.
              </AlertDescription>
            </Alert>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={filteredRacks.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={filteredRacks.length === 0 ? "Select a room first" : "Select a rack"} />
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
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="start_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Level</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Level</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="positions_per_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Positions Per Level</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
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
                          placeholder="These notes will be applied to all created locations" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Available for Use</FormLabel>
                        <FormDescription>
                          Mark all created locations as available for housing animals
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Will create </span>
                    <span className="font-semibold">{totalLocations}</span>
                    <span className="text-muted-foreground"> locations</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onClose()}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => selectedRoom && selectedRack && setActiveTab("preview")}
                      disabled={!selectedRoom || !selectedRack}>
                      Preview
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Generating..." : "Generate Locations"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 pt-4">
            <LocationsVisualizer
              selectedRoom={selectedRoom}
              selectedRack={selectedRack}
              startLevel={formValues.start_level || 1}
              endLevel={formValues.end_level || 1}
              positionsPerLevel={formValues.positions_per_level || 1}
              isShowingOccupied={!formValues.is_available}
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
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Locations"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 