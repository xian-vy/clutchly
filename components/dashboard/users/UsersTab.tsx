'use client';

import { createUser, deleteUser, getUsers, updateUser } from '@/app/api/users/users';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { CreateUser, User } from '@/lib/types/users';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '@/app/api/organizations/organizations';
import { Organization } from '@/lib/types/organizations';

export default function UsersTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    resources: users,
    isLoading: usersLoading,
    selectedResource: selectedUser,
    setSelectedResource: setSelectedUser,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<User, CreateUser>({
    resourceName: 'User',
    queryKey: ['users'],
    getResources: getUsers,
    createResource: createUser,
    updateResource: updateUser,
    deleteResource: deleteUser,
  });

  const { data: organization, isLoading: profileLoading, error: organizationError } = useQuery<Organization>({
    queryKey: ['organization2'],
    queryFn: async () => {
      const data = await getOrganization();
      return Array.isArray(data) ? data[0] : data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
  });

  const isLoading = usersLoading || profileLoading;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    );
  }

  if (organizationError) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh] text-destructive'>
        Error loading organization data. Please try refreshing the page.
      </div>
    );
  }

  const onDialogChange = () => {
    setIsDialogOpen(false);
    setSelectedUser(undefined);
  };

  return (
    <div className="space-y-6">
      <UserList
        users={users}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <UserForm
            initialData={selectedUser}
            onSubmit={async (data) => {
              const success = selectedUser
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                onDialogChange();
              }
            }}
            onCancel={onDialogChange}
            organization={organization}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}