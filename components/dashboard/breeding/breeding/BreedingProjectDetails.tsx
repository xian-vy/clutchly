'use client';

import { createClutch, getClutches, updateClutch } from '@/app/api/breeding/clutches';
import { createReptile, deleteReptile, getReptileByClutchId, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { BreedingProject, Clutch, IncubationStatus, NewClutch } from '@/lib/types/breeding';
import { NewReptile, Reptile, ReptileGeneInfo } from '@/lib/types/reptile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import BreedingProjecParentsInfo from './BreedingProjecParentsInfo';
import { ClutchesList } from './clutch/ClutchesList';
import { HatchlingForm } from './hatchling/HatchlingForm';
import { PlusCircle } from 'lucide-react';
import { ClutchForm } from './clutch/ClutchForm';

interface BreedingProjectDetailsProps {
  project: BreedingProject;
}


export function BreedingProjectDetails({
  project,
}: BreedingProjectDetailsProps) {
  const [isAddHatchlingDialogOpen, setIsAddHatchlingDialogOpen] = useState(false);
  const [selectedClutchId, setSelectedClutchId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {morphs} = useMorphsStore()
  const [clutchDialogOpen, setClutchDialogOpen] = useState(false);

  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  const {
    resources: allHatchlings,
    handleCreate: handleCreateHatchling,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Hatchling',
    queryKey: ['all-hatchlings', project.id],
    getResources: async () => {
      const result: Reptile[] = [];
      const clutchesData = await getClutches(project.id);
      for (const clutch of clutchesData) {
        const hatchlings = await getReptileByClutchId(clutch.id);
        if (Array.isArray(hatchlings)) {
          result.push(...hatchlings);
        } else if (hatchlings) {
          result.push(hatchlings);
        }
      }
      return result;
    },
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  });

  // Create a map of reptile IDs to names for quick lookup
  const reptileMap = new Map<string, ReptileGeneInfo>();
  reptiles.forEach(reptile => {
    const morphName = reptile.morph_id ? morphs.find(m => m.id.toString() === reptile.morph_id.toString())?.name || 'Unknown' : 'None';
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
    
      if (!handleCreateHatchling) {
        throw new Error('Create operation not available');
      }

    try {
      await  handleCreateHatchling({
        ...data,
        parent_clutch_id: selectedClutchId,
      });

      queryClient.invalidateQueries({ queryKey: ['reptiles'] });

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

  const hatchlingsByClutch = allHatchlings.reduce((acc, hatchling) => {
    if (hatchling.parent_clutch_id) {
      acc[hatchling.parent_clutch_id] = acc[hatchling.parent_clutch_id] || [];
      acc[hatchling.parent_clutch_id].push(hatchling);
    }
    return acc;
  }, {} as Record<string, Reptile[]>);

  const handleClutchSubmit = async (data: NewClutch) => {
    try {
      await createClutch({ ...data,  breeding_project_id: project.id, });
      toast.success('Clutch added successfully');
      queryClient.invalidateQueries({ queryKey: ['clutches', project.id] });
      queryClient.invalidateQueries({ queryKey: ['all-hatchlings', project.id] });
      setClutchDialogOpen(false);
    } catch (error) {
      console.error('Error saving clutch:', error);
      toast.error(`Failed to add clutch`);
    }
  };
  return (
    <div className="space-y-6">
  
  <Tabs defaultValue="project-details">
    <TabsList>
      <TabsTrigger value="project-details">Breeders</TabsTrigger>
      <TabsTrigger value="project-info">Brood</TabsTrigger>
      </TabsList>
      <TabsContent value="project-details">
          {/* Parents Info */}
          <BreedingProjecParentsInfo reptileMap={reptileMap} project={project} />

          {project.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p  className="text-sm">{project.notes}</p>
            </div>
          )}
      </TabsContent>
      <TabsContent value="project-info">
          <div className="space-y-4 pt-3">
            {/* Clutches and Hatchlings */} 
            {clutches.length > 0 ? (
              <Tabs defaultValue={clutches[0]?.id} className="w-full">
                <TabsList className="w-full justify-center">
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
                      hatchlings={{ [clutch.id]: hatchlingsByClutch[clutch.id] || [] }}
                      onAddHatchling={handleAddHatchlingClick}
                      onUpdateIncubationStatus={handleUpdateIncubationStatus}
                      project={project}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Card onClick={()=>setClutchDialogOpen(true)} className="p- cursor-pointer text-center text-muted-foreground flex flex-col">
                <p className='text-xs sm:text-sm'>No clutches added yet. Click Add Clutch to get started.</p>
                <PlusCircle strokeWidth={1.5} className="mx-auto h-8 w-8 text-muted-foreground" />
              </Card>
            )}
          </div>
      </TabsContent>
      </Tabs>


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
      <Dialog open={clutchDialogOpen} onOpenChange={(open) => {setClutchDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add Clutch</DialogTitle>
          <ClutchForm
            breedingProjectId={project.id}
            onSubmit={handleClutchSubmit}
            onCancel={() => {
              setClutchDialogOpen(false);
            }}
            speciesID={project.species_id}
            initialData={undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}