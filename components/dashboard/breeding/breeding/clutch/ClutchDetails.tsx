'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clutch, Hatchling, IncubationStatus, NewHatchling } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { HatchlingsList } from '../hatchling/HatchlingsList';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { createHatchling } from '@/app/api/breeding/hatchlings';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HatchlingForm } from '../hatchling/HatchlingForm';

interface ClutchDetailsProps {
  clutch: Clutch;
  hatchlings: Hatchling[];
  onUpdateClutch: (id: string, data: Partial<Clutch>) => Promise<void>;
}

const incubationStatusColors = {
  not_started: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function ClutchDetails({
  clutch,
  hatchlings,
  onUpdateClutch,
}: ClutchDetailsProps) {
  const [isAddHatchlingDialogOpen, setIsAddHatchlingDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleAddHatchling = async (data: NewHatchling) => {
    try {
      await createHatchling({
        ...data,
        clutch_id: clutch.id,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['hatchlings', clutch.id] });
      
      toast.success('Hatchling added successfully');
      setIsAddHatchlingDialogOpen(false);
    } catch (error) {
      console.error('Error adding hatchling:', error);
      toast.error('Failed to add hatchling');
    }
  };

  const handleUpdateIncubationStatus = async (status: IncubationStatus) => {
    try {
      await onUpdateClutch(clutch.id, { incubation_status: status });
      toast.success('Incubation status updated');
    } catch (error) {
      console.error('Error updating incubation status:', error);
      toast.error('Failed to update incubation status');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clutch Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lay Date</p>
              <p>{format(new Date(clutch.lay_date), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Egg Count</p>
              <p>{clutch.egg_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fertile Count</p>
              <p>{clutch.fertile_count || 'Not recorded'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hatch Date</p>
              <p>{clutch.hatch_date ? format(new Date(clutch.hatch_date), 'MMM d, yyyy') : 'Not hatched'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Incubation Status</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`${
                  incubationStatusColors[clutch.incubation_status]
                } text-white capitalize`}
              >
                {clutch.incubation_status.replace('_', ' ')}
              </Badge>
              <div className="flex gap-2 ml-2">
                {clutch.incubation_status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateIncubationStatus('completed')}
                  >
                    Mark as Completed
                  </Button>
                )}
                {clutch.incubation_status !== 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateIncubationStatus('failed')}
                  >
                    Mark as Failed
                  </Button>
                )}
              </div>
            </div>
          </div>

          {clutch.incubation_temp && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Incubation Temperature</p>
              <p>{clutch.incubation_temp}°C</p>
            </div>
          )}

          {clutch.incubation_humidity && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Incubation Humidity</p>
              <p>{clutch.incubation_humidity}%</p>
            </div>
          )}

          {clutch.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p>{clutch.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <HatchlingsList
        hatchlings={hatchlings}
        onAddNew={() => setIsAddHatchlingDialogOpen(true)}
      />

      <Dialog open={isAddHatchlingDialogOpen} onOpenChange={setIsAddHatchlingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add Hatchling</DialogTitle>
          <HatchlingForm
            clutchId={clutch.id}
            onSubmit={handleAddHatchling}
            onCancel={() => setIsAddHatchlingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 