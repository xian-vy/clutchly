'use client';

import { useResource } from '@/lib/hooks/useResource';
import { AccessProfileWithControls, CreateAccessProfile } from '@/lib/types/access';
import { getAccessProfiles, createAccessProfile, updateAccessProfile, deleteAccessProfile, getPages } from '@/app/api/users/access';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { AccessProfileForm } from './AccessProfileForm';
import { AccessProfileList } from './AccessProfileList';
import { useQuery } from '@tanstack/react-query';
import { Page } from '@/lib/types/pages';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AccessControlTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AccessProfileWithControls | null>(null);
  const {organization,user} = useAuthStore()

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ['pages'],
    queryFn: async ()=> {
      if (!user) return [];
      return getPages(user)
    },
  });

  const {
    resources: profiles,
    isLoading: profilesLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    setSelectedResource,
  } = useResource<AccessProfileWithControls, CreateAccessProfile>({
    resourceName: 'Access Profile',
    queryKey: ['access-profiles'],
    getResources: async ()=> {
      if (!organization) return [];
      return getAccessProfiles(organization);
    },
    createResource: createAccessProfile,
    updateResource: updateAccessProfile,
    deleteResource: deleteAccessProfile,
  });

  const handleEdit = (profile: AccessProfileWithControls) => {
    setSelectedProfile(profile);
    setSelectedResource(profile);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedProfile(null);
    setSelectedResource(undefined);
  };

  const handleSubmit = async (data: CreateAccessProfile) => {
    try {
      if (selectedProfile) {
        await handleUpdate(data);
      } else {
        await handleCreate(data);
      }
      handleClose();
    } catch (error) {
      console.error('Error submitting access profile:', error);
    }
  };

  if (profilesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AccessProfileList
        profiles={profiles || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-xl md:max-w-3xl">
          <DialogTitle>
            {selectedProfile ? 'Edit Access Profile' : 'Create Access Profile'}
          </DialogTitle>
          <AccessProfileForm
            profile={selectedProfile}
            org_id={organization?.id}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            pages={pages}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}