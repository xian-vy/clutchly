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
          <DialogTitle>Project Details</DialogTitle>
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