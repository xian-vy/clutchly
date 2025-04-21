'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Room } from '@/lib/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define form schema
const roomFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  notes: z.string().nullable(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom?: Room;
  onSubmit: (data: RoomFormValues) => Promise<boolean>;
  onDelete?: (id: string) => Promise<void>;
}

export function RoomForm({ isOpen, onClose, selectedRoom, onSubmit, onDelete }: RoomFormProps) {
  const form = useForm<RoomFormValues>({
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

  const handleSubmit = async (data: RoomFormValues) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (selectedRoom && onDelete) {
      await onDelete(selectedRoom.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {selectedRoom ? 'Edit Room' : 'Add New Room'}
        </DialogTitle>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              {selectedRoom && onDelete && (
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
                {selectedRoom ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 