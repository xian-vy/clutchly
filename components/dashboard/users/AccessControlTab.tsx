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
import { Page } from '@/app/api/users/access';
import { getOrganization } from '@/app/api/organizations/organizations';
import { Organization } from '@/lib/types/organizations';

export default function AccessControlTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AccessProfileWithControls | null>(null);

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ['pages'],
    queryFn: getPages,
  });

  const { data: organization } = useQuery<Organization>({
    queryKey: ['organization2'],
    queryFn: async () => {
      const data = await getOrganization();
      return Array.isArray(data) ? data[0] : data;
    },

  });

  const {
    resources: profiles,
    isLoading: profilesLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<AccessProfileWithControls, CreateAccessProfile>({
    resourceName: 'Access Profile',
    queryKey: ['access-profiles'],
    getResources: getAccessProfiles,
    createResource: createAccessProfile,
    updateResource: updateAccessProfile,
    deleteResource: deleteAccessProfile,
  });

  const handleEdit = (profile: AccessProfileWithControls) => {
    setSelectedProfile(profile);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedProfile(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (data: CreateAccessProfile) => {
    if (selectedProfile) {
      await handleUpdate( data);
    } else {
      await handleCreate(data);
    }
    handleClose();
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
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