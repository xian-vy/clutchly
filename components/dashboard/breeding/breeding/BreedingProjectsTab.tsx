'use client';

import { createBreedingProject, deleteBreedingProject, getBreedingProjects, updateBreedingProject } from '@/app/api/breeding/projects';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { BreedingProject, NewBreedingProject } from '@/lib/types/breeding';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BreedingProjectDetails } from './BreedingProjectDetails';
import { BreedingProjectForm } from './BreedingProjectForm';
import { BreedingProjectList } from './BreedingProjectList';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { format } from 'date-fns';

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




  if (projectsLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
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
        projects={projects}
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle className='flex flex-col items-start gap-2 text-base'>
            {selectedProjectForDetails?.name}
            <div className="flex justify-between w-full items-center">
                <Badge variant="custom"  className={`${STATUS_COLORS[selectedProjectForDetails?.status.toLowerCase() as keyof typeof STATUS_COLORS]} !capitalize`}>
                    {selectedProjectForDetails?.status}
                </Badge>
                <div className="flex gap-5">
                      <div className='flex items-center gap-2'>
                          <p className="text-xs font-medium text-muted-foreground">Start Date</p>
                          <p className='text-xs'>{format(new Date(selectedProjectForDetails?.start_date || new Date()), 'MMM d, yyyy')}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                          <p className="text-xs font-medium text-muted-foreground">Expected Hatch</p>
                          <p className='text-xs'>
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