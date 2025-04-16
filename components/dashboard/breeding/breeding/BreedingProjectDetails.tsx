'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BreedingProject, Clutch, NewClutch, IncubationStatus } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getClutches } from '@/app/api/breeding/clutches';
import { createClutch, updateClutch } from '@/app/api/breeding/clutches';
import { toast } from 'sonner';
import { createReptile, getReptileByClutchId, getReptiles } from '@/app/api/reptiles/reptiles';
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { ClutchForm } from './clutch/ClutchForm';
import { HatchlingForm } from './hatchling/HatchlingForm';
import { ClutchesList } from './clutch/ClutchesList';

interface BreedingProjectDetailsProps {
  project: BreedingProject;
}



export function BreedingProjectDetails({
  project,
}: BreedingProjectDetailsProps) {
  const [isAddClutchDialogOpen, setIsAddClutchDialogOpen] = useState(false);
  const [isAddHatchlingDialogOpen, setIsAddHatchlingDialogOpen] = useState(false);
  const [selectedClutchId, setSelectedClutchId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch reptiles to get parent names
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Create a map of reptile IDs to names for quick lookup
  const reptileMap = new Map<string, string>();
  reptiles.forEach(reptile => {
    reptileMap.set(reptile.id, reptile.name);
  });

  // Fetch clutches for this project
  const { data: clutches = [] } = useQuery<Clutch[]>({
    queryKey: ['clutches', project.id],
    queryFn: () => getClutches(project.id),
  });

  // Fetch hatchlings for all clutches
  const { data: allHatchlings = {} } = useQuery<Record<string, Reptile[]>>({
    queryKey: ['all-hatchlings', project.id],
    queryFn: async () => {
      const result: Record<string, Reptile[]> = {};
      
      for (const clutch of clutches) {
        const hatchlings = await getReptileByClutchId(clutch.id);
        result[clutch.id] = Array.isArray(hatchlings) ? hatchlings : [hatchlings];
      }
      
      return result;
    },
    enabled: clutches.length > 0,
  });

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
      setIsAddClutchDialogOpen(false);
    } catch (error) {
      console.error('Error adding clutch:', error);
      toast.error('Failed to add clutch');
    }
  };

  const handleUpdateClutch = async (id: string, data: Partial<Clutch>) => {
    try {
      // Convert Partial<Clutch> to NewClutch by ensuring breeding_project_id is set
      const newClutch: NewClutch = {
        ...data,
        breeding_project_id: project.id,
      } as NewClutch;
      
      await updateClutch(id, newClutch);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['clutches', project.id] });
      
      toast.success('Clutch updated successfully');
    } catch (error) {
      console.error('Error updating clutch:', error);
      toast.error('Failed to update clutch');
    }
  };

  const handleAddHatchling = async (data: NewReptile) => {
    if (!selectedClutchId) return;
    
    try {
      await createReptile({
        ...data,
        parent_clutch_id: selectedClutchId,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['all-hatchlings', project.id] });
      
      toast.success('Hatchling added successfully');
      setIsAddHatchlingDialogOpen(false);
    } catch (error) {
      console.error('Error adding hatchling:', error);
      toast.error('Failed to add hatchling');
    }
  };

  const handleUpdateIncubationStatus = async (clutchId: string, status: IncubationStatus) => {
    try {
      await handleUpdateClutch(clutchId, { incubation_status: status });
      toast.success('Incubation status updated');
    } catch (error) {
      console.error('Error updating incubation status:', error);
      toast.error('Failed to update incubation status');
    }
  };

  const handleAddHatchlingClick = (clutchId: string) => {
    setSelectedClutchId(clutchId);
    setIsAddHatchlingDialogOpen(true);
  };

  const selectedClutch = clutches.find(c => c.id === selectedClutchId) || null;

  return (
    <div className="space-y-6">
      <Card className='shadow-none border'>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{project.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge
                variant="custom"
                className={STATUS_COLORS[project.status.toLowerCase() as keyof typeof STATUS_COLORS]}
              >
                {project.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sire (Male)</p>
              <p>{reptileMap.get(project.male_id) || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dam (Female)</p>
              <p>{reptileMap.get(project.female_id) || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              <p>{format(new Date(project.start_date), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expected Hatch</p>
              <p>
                {project.expected_hatch_date
                  ? format(new Date(project.expected_hatch_date), 'MMM d, yyyy')
                  : 'Not set'}
              </p>
            </div>
          </div>

          {project.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p>{project.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Clutches & Hatchlings</h2>
          <Button onClick={() => setIsAddClutchDialogOpen(true)}>
            Add Clutch
          </Button>
        </div>

        <ClutchesList 
          clutches={clutches}
          hatchlings={allHatchlings}
          onAddHatchling={handleAddHatchlingClick}
          onUpdateIncubationStatus={handleUpdateIncubationStatus}
        />
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

      <Dialog open={isAddHatchlingDialogOpen} onOpenChange={setIsAddHatchlingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add Hatchling</DialogTitle>
          {selectedClutch && (
            <HatchlingForm
              projectDetails={project}
              clutch={selectedClutch}
              onSubmit={handleAddHatchling}
              onCancel={() => setIsAddHatchlingDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}