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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          {selectedRack ? 'Edit Rack' : 'Add New Rack'}
        </DialogTitle>
        
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
              <Button type="submit">
                {selectedRack ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 