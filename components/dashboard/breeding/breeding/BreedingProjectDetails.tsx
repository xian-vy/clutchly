'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreedingProject, Clutch, Hatchling, NewClutch, IncubationStatus, NewHatchling } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getClutches } from '@/app/api/breeding/clutches';
import { getHatchlings } from '@/app/api/breeding/hatchlings';
import { createClutch, updateClutch } from '@/app/api/breeding/clutches';
import { createHatchling } from '@/app/api/breeding/hatchlings';
import { toast } from 'sonner';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Reptile } from '@/lib/types/reptile';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { HatchlingsList } from './hatchling/HatchlingsList';
import { ClutchForm } from './clutch/ClutchForm';
import { HatchlingForm } from './hatchling/HatchlingForm';

interface BreedingProjectDetailsProps {
  project: BreedingProject;
}



const incubationStatusColors = {
  not_started: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function BreedingProjectDetails({
  project,
}: BreedingProjectDetailsProps) {
  const [isAddClutchDialogOpen, setIsAddClutchDialogOpen] = useState(false);
  const [isAddHatchlingDialogOpen, setIsAddHatchlingDialogOpen] = useState(false);
  const [selectedClutch, setSelectedClutch] = useState<Clutch | null>(null);
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

  // Fetch hatchlings for the selected clutch
  const { data: hatchlings = [] } = useQuery<Hatchling[]>({
    queryKey: ['hatchlings', selectedClutch?.id],
    queryFn: () => selectedClutch ? getHatchlings(selectedClutch.id) : Promise.resolve([]),
    enabled: !!selectedClutch,
  });

  const handleAddClutch = async (data: NewClutch) => {
    try {
      await createClutch({
        ...data,
        breeding_project_id: project.id,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['clutches', project.id] });
      
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

  const handleAddHatchling = async (data: NewHatchling) => {
    if (!selectedClutch) return;
    
    try {
      await createHatchling({
        ...data,
        clutch_id: selectedClutch.id,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['hatchlings', selectedClutch.id] });
      
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

  return (
    <div className="space-y-6">
      <Card className='shadow-none border'>
        <CardContent className="space-y-4">
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

      <Tabs defaultValue="clutches" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="clutches">Clutches</TabsTrigger>
          <TabsTrigger value="hatchlings" disabled={!selectedClutch}>
            Hatchlings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clutches" className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Clutches</h2>
              <Button onClick={() => setIsAddClutchDialogOpen(true)}>
                Add Clutch
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clutches.map((clutch) => (
                <Card key={clutch.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedClutch(clutch)}>
                  <CardHeader>
                    <CardTitle className="text-lg">Clutch from {format(new Date(clutch.lay_date), 'MMM d, yyyy')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
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
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge
                          className={`${
                            incubationStatusColors[clutch.incubation_status]
                          } text-white capitalize`}
                        >
                          {clutch.incubation_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {clutch.incubation_status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateIncubationStatus(clutch.id, 'completed');
                          }}
                        >
                          Mark as Completed
                        </Button>
                      )}
                      {clutch.incubation_status !== 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateIncubationStatus(clutch.id, 'failed');
                          }}
                        >
                          Mark as Failed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {clutches.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No clutches found. Add one to get started!
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="hatchlings" className="p-4">
          {selectedClutch ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Hatchlings for Clutch from {format(new Date(selectedClutch.lay_date), 'MMM d, yyyy')}
                </h2>
                <Button onClick={() => setIsAddHatchlingDialogOpen(true)}>
                  Add Hatchling
                </Button>
              </div>

              <HatchlingsList
                hatchlings={hatchlings}
                onAddNew={() => setIsAddHatchlingDialogOpen(true)}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a clutch to view its hatchlings
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddClutchDialogOpen} onOpenChange={setIsAddClutchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add Clutch</DialogTitle>
          <ClutchForm
            breedingProjectId={project.id}
            onSubmit={handleAddClutch}
            onCancel={() => setIsAddClutchDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddHatchlingDialogOpen} onOpenChange={setIsAddHatchlingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add Hatchling</DialogTitle>
          {selectedClutch && (
            <HatchlingForm
              clutchId={selectedClutch.id}
              onSubmit={handleAddHatchling}
              onCancel={() => setIsAddHatchlingDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
} 