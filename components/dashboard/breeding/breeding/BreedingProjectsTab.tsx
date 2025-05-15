'use client';

import { createBreedingProject, deleteBreedingProject, getBreedingProjects, updateBreedingProject } from '@/app/api/breeding/projects';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { BreedingProject, Clutch, NewBreedingProject } from '@/lib/types/breeding';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BreedingProjectDetails } from './BreedingProjectDetails';
import { BreedingProjectForm } from './BreedingProjectForm';
import { BreedingProjectList } from './BreedingProjectList';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { getAllClutches } from '@/app/api/breeding/clutches';

export function BreedingProjectsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<BreedingProject | null>(null);

  const {
    resources: projects,
    isLoading: projectsLoading,
    selectedResource: selectedProject,
    setSelectedResource: setSelectedProject,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<BreedingProject, NewBreedingProject>({
    resourceName: 'Breeding Project',
    queryKey: ['breeding-projects'],
    getResources: getBreedingProjects,
    createResource: createBreedingProject,
    updateResource: updateBreedingProject,
    deleteResource: deleteBreedingProject,
  });

  const { data: reptiles = [], isLoading: reptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  const { data: allClutches = [], isLoading: clutchesLoading } = useQuery<Clutch[]>({
    queryKey: ['clutches'],
    queryFn: () => getAllClutches(), 
  });


  const getProjectStats = useMemo(() => {
    if (!reptiles || !allClutches) return () => null;
    if (reptilesLoading || clutchesLoading) return () => null;
    const statsMap = new Map<string, { clutchCount: number; hatchlingCount: number; totalReptiles: number }>();
    return (project: BreedingProject) => {
      // Check if we already calculated stats for this project
      const cached = statsMap.get(project.id);
      if (cached) return cached;

      // Calculate stats if not cached
      const projectReptiles = reptiles.filter(r => 
        r.project_ids?.includes(project.id)
      );

      const projectClutches = allClutches.filter(c => 
        c.breeding_project_id === project.id
      );

      const projectClutchIds = projectClutches.map(c => c.id);

      const hatchlingCount = reptiles.filter(r => 
        r.parent_clutch_id && projectClutchIds.includes(r.parent_clutch_id)
      ).length;

      const stats = {
        clutchCount: projectClutches.length,
        hatchlingCount,
        totalReptiles: projectReptiles.length
      };

      // Cache the result
      statsMap.set(project.id, stats);
      return stats;
    };
  }, [reptiles, allClutches, reptilesLoading, clutchesLoading]);

  if (projectsLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
  }

  const handleCloseProjectDetails = () => {
    setIsDetailsDialogOpen(false);
    setSelectedProjectForDetails(null);
  }

  return (
    <div className="space-y-6">
      <BreedingProjectList
       projects={projects.map(project => {
        const stats = getProjectStats(project);
        return {
          ...project,
          clutchCount: stats?.clutchCount || 0,
          hatchlingCount: stats?.hatchlingCount || 0,
          totalReptiles: stats?.totalReptiles || 0
        };
      })}
        onEdit={(project) => {
          setSelectedProject(project);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
        onViewDetails={(project) => {
          setSelectedProjectForDetails(project);
          setIsDetailsDialogOpen(true);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedProject ? 'Edit Breeding Project' : 'Add New Breeding Project'}
          </DialogTitle>
          <BreedingProjectForm
            initialData={selectedProject}
            onSubmit={async (data) => {
              const success = selectedProject
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                setIsDialogOpen(false);
                setSelectedProject(undefined);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedProject(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={handleCloseProjectDetails}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
          <DialogTitle className='flex flex-col items-start gap-2 text-base'>
            {selectedProjectForDetails?.name}
            <div className="flex flex-col sm:flex-row items-start justify-between w-full sm:items-center gap-2">
                <Badge variant="custom"  className={`${STATUS_COLORS[selectedProjectForDetails?.status.toLowerCase() as keyof typeof STATUS_COLORS]} !capitalize`}>
                    {selectedProjectForDetails?.status}
                </Badge>
                <div className="flex gap-5">
                      <div className='flex items-center gap-2'>
                          <p className="text-xs 2xl:text-[0.8rem] 3xl:text-sm font-medium text-muted-foreground">Start Date:</p>
                          <p className='text-xs 2xl:text-[0.8rem] 3xl:text-sm text-muted-foreground'>{format(new Date(selectedProjectForDetails?.start_date || new Date()), 'MMM d, yyyy')}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                          <p className="text-xs 2xl:text-[0.8rem] 3xl:text-sm font-medium text-muted-foreground">Expected Hatch:</p>
                          <p className='text-xs 2xl:text-[0.8rem] 3xl:text-sm text-muted-foreground'>
                            {selectedProjectForDetails?.expected_hatch_date
                              ? format(new Date(selectedProjectForDetails?.expected_hatch_date), 'MMM d, yyyy')
                              : 'Not set'}
                          </p>
                      </div>
                  </div>
            </div>

          </DialogTitle>
          {selectedProjectForDetails && (
            <BreedingProjectDetails
              project={selectedProjectForDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 