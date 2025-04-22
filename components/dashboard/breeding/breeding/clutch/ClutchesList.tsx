'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INCUBATION_STATUS_COLORS } from '@/lib/constants/colors';
import { BreedingProject, Clutch, IncubationStatus, NewClutch } from '@/lib/types/breeding';
import { Reptile } from '@/lib/types/reptile';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { HatchlingsList } from '../hatchling/HatchlingsList';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ClutchForm } from './ClutchForm';
import { createClutch,  } from '@/app/api/breeding/clutches';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ClutchesListProps {
  clutch: Clutch;
  hatchlings: Record<string, Reptile[]>;
  onAddHatchling: (clutchId: string) => void;
  onUpdateIncubationStatus: (clutchId: string, status: IncubationStatus) => void;
  project : BreedingProject
}

export function ClutchesList({
  clutch,
  hatchlings,
  onAddHatchling,
  onUpdateIncubationStatus,
  project
}: ClutchesListProps) {
  const [isAddClutchDialogOpen, setIsAddClutchDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleAddClutch = async (data: NewClutch) => {
    try {
      await createClutch({
        ...data,
        breeding_project_id: project.id,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['clutches', project.id] });
      queryClient.invalidateQueries({ queryKey: ['all-hatchlings', project.id] });
      
      toast.success('Clutch added successfully');
    } catch (error) {
      console.error('Error adding clutch:', error);
      toast.error('Failed to add clutch');
    }
  };

  return (
    <div className="space-y-4">
        <div key={clutch.id} className="rounded-lg  bg-card">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Clutch Info
              </CardTitle>
          
              <div className="flex justify-end items-center">
                <Button size="sm"  onClick={() => setIsAddClutchDialogOpen(true)}>
                <Plus />  Add Clutch
              </Button>
            </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 border rounded-md p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Egg Count</p>
                  <p className="text-sm font-semibold">{clutch.egg_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Fertile Count</p>
                  <p className="text-sm font-semibold">{clutch.fertile_count || 'Not recorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Hatch Date</p>
                  <p className="text-sm font-semibold">{clutch.hatch_date ? format(new Date(clutch.hatch_date), 'MMM d, yyyy') : 'Not hatched'}</p>
                </div>
                <Badge
                className={`${
                  INCUBATION_STATUS_COLORS[clutch.incubation_status]
                } capitalize`}
              >
                {clutch.incubation_status.replace('_', ' ')}
              </Badge>
                <div className="flex gap-2 justify-end">
                {clutch.incubation_status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateIncubationStatus(clutch.id, 'completed');
                    }}
                    className='text-xs'
                  >
                    Mark Completed
                  </Button>
                )}
                {clutch.incubation_status !== 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateIncubationStatus(clutch.id, 'failed');
                    }}
                    className='text-xs'
                  >
                    Mark Failed
                  </Button>
                )}
              </div>
              </div>
             
            </CardContent>
          </Card>

          <div className="px-6 pb-6 pt-2 ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Hatchlings</h3>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddHatchling(clutch.id);
                }}
              >
                <Plus className="w-4 h-4" /> Add Hatchling
              </Button>
            </div>
            
            <HatchlingsList hatchlings={hatchlings[clutch.id] || []} />
          </div>
        </div>
      
        <Dialog open={isAddClutchDialogOpen} onOpenChange={setIsAddClutchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add Clutch</DialogTitle>
          <ClutchForm
            breedingProjectId={project.id}
            onSubmit={handleAddClutch}
            onCancel={() => setIsAddClutchDialogOpen(false)}
            speciesID={project.species_id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}