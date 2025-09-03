'use client';

import { createUser, deleteUser, getUsers, updateUser, resendEmailConfirmation } from '@/app/api/users/users';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { CreateUser, User } from '@/lib/types/users';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import {toast} from 'sonner'
import { useAuthStore } from '@/lib/stores/authStore';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

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
    queryKey: [CACHE_KEYS.USERS],
    getResources: getUsers,
    createResource: async (data) => {
      const result = await createUser(data);
      toast.success('User created successfully');
      return result.user;
    },
    updateResource: updateUser,
    deleteResource: deleteUser,
  });

  const {organization, isLoading : orgLoading} = useAuthStore();


  const isLoading = usersLoading || orgLoading;

  const handleResendConfirmation = async (email: string) => {
    try {
      await resendEmailConfirmation(email);
      toast.success('Confirmation email resent successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to resend confirmation email');
      }
    }
  };

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-4 h-4 animate-spin text-primary' />
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
        onResendConfirmation={handleResendConfirmation}
        organizationId={organization?.id}
      />

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[500px]">
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