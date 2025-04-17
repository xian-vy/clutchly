'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BreedingProject, Clutch, NewClutch, IncubationStatus } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getClutches } from '@/app/api/breeding/clutches';
import { createClutch, updateClutch } from '@/app/api/breeding/clutches';
import { toast } from 'sonner';
import { createReptile, deleteReptile, getReptileByClutchId, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { HetTrait, NewReptile, Reptile } from '@/lib/types/reptile';
import { ClutchForm } from './clutch/ClutchForm';
import { HatchlingForm } from './hatchling/HatchlingForm';
import { ClutchesList } from './clutch/ClutchesList';
import { Mars, Plus, Venus, X } from 'lucide-react';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useResource } from '@/lib/hooks/useResource';

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
  const {morphs} = useMorphsStore()

  const {
    resources: reptiles,
    isLoading: reptilesLoading,
    selectedResource: selectedReptile,
    setSelectedResource: setSelectedReptile,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  })

  // Create a map of reptile IDs to names for quick lookup
  const reptileMap = new Map<string, { name: string; morphName: string, hets : HetTrait[] | null, visuals : string[] | null }>();
  reptiles.forEach(reptile => {
    const morphName = reptile.morph_id ? morphs.find(m => m.id.toString() === reptile.morph_id)?.name || 'Unknown' : 'None';
    reptileMap.set(reptile.id, { 
      name: reptile.name,
      morphName: morphName,
      hets : reptile.het_traits,
      visuals : reptile.visual_traits
    });
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
       handleCreate({
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
        <CardContent className="space-y-4 ">
  
          {/* Parents Info */}
          <div className="flex items-start justify-center gap-10 2xl:gap-16">
              <div className='flex flex-col items-center gap-1'>
                    <p className='text-sm text-center  flex gap-1 font-semibold'>
                        {reptileMap.get(project.male_id)?.name || 'Unknown'}
                        <Mars className="h-4 w-4 text-blue-400"/>
                    </p>
                    <p className='text-xs text-center '> {reptileMap.get(project.male_id)?.morphName}</p>
                    <div className='space-y-1'>
                        <div className="flex items-center justify-center gap-1.5">
                            {reptileMap.get(project.male_id)?.visuals?.length === 0  &&
                              <span className='text-xs text-red-500 dark:text-red-300'>No Visual Traits</span>
                            }
                            {reptileMap.get(project.male_id)?.visuals?.map((visualtrait, index) =>
                              <Badge key={index}  variant="secondary" className='text-[0.7rem]'>{visualtrait}</Badge>
                            )}
                        </div>
                        <div className="flex  items-center justify-center gap-1.5">
                            {reptileMap.get(project.male_id)?.hets?.length === 0  &&
                              <span className='text-xs text-red-500 dark:text-red-300'>No Het Traits</span>
                            }
                            {reptileMap.get(project.male_id)?.hets?.map((het, index) =>
                              <Badge key={index}  variant="secondary"  className='text-[0.7rem]'>{het.percentage} {" % ph "}{het.trait}</Badge>
                            )}
                        </div>
                    </div>
              </div>
              <div className="my-auto">
                 <X className='text-muted-foreground'/>
              </div>                        
              <div  className='flex flex-col items-center  gap-1'>
                    <p className='text-sm flex gap-1 font-semibold'>
                        {reptileMap.get(project.female_id)?.name || 'Unknown'}
                        <Venus className="h-4 w-4 text-red-500"/>
                    </p>
                    <p className='text-xs text-center'> {reptileMap.get(project.female_id)?.morphName} </p>
                    <div className='space-y-1'>
                      <div className="flex items-center justify-center gap-1.5">
                          {reptileMap.get(project.female_id)?.visuals?.length === 0  &&
                            <span className='text-xs text-red-500 dark:text-red-300'>No Visual Traits</span>
                          }
                          {reptileMap.get(project.female_id)?.visuals?.map((visualtrait, index) =>
                            <Badge key={index}  variant="secondary" className='text-[0.7rem]'>{visualtrait}</Badge>
                          )}
                      </div>
                      <div className="flex  items-center justify-center gap-1.5">
                         {reptileMap.get(project.female_id)?.hets?.length === 0  &&
                            <span className='text-xs text-red-500 dark:text-red-300'>No Het Traits</span>
                          }
                          {reptileMap.get(project.female_id)?.hets?.map((het, index) =>
                            <Badge key={index}  variant="secondary"  className='text-[0.7rem]'>{het.percentage} {" % ph "}{het.trait}</Badge>
                          )}
                      </div>
                  </div>
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
          <h2 className="text-base font-semibold">Clutches & Hatchlings</h2>
          <Button size="sm"  onClick={() => setIsAddClutchDialogOpen(true)}>
           <Plus />  Add Clutch
          </Button>
        </div>

        {clutches.length > 0 ? (
          <Tabs defaultValue={clutches[0]?.id} className="w-full">
            <TabsList className="w-full justify-start">
              {clutches.map((clutch) => (
                <TabsTrigger key={clutch.id} value={clutch.id} className="min-w-[120px]">
                  {format(new Date(clutch.lay_date), 'MMM d, yyyy')}
                </TabsTrigger>
              ))}
            </TabsList>
            {clutches.map((clutch) => (
              <TabsContent key={clutch.id} value={clutch.id}>
                <ClutchesList 
                  clutch={clutch}
                  hatchlings={{ [clutch.id]: allHatchlings[clutch.id] || [] }}
                  onAddHatchling={handleAddHatchlingClick}
                  onUpdateIncubationStatus={handleUpdateIncubationStatus}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No clutches added yet. Click "Add Clutch" to get started.</p>
          </Card>
        )}
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
        <DialogContent className="sm:max-w-[700px]">
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