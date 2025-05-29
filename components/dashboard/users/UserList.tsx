'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types/users';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAccessProfiles } from '@/app/api/users/access';
import { AccessProfile } from '@/lib/types/access';

// Supabase email confirmation expiration is 24 hours
const EMAIL_CONFIRMATION_EXPIRATION_MS = 24 * 60 * 60 * 1000;

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onResendConfirmation: (email: string) => Promise<void>;
  organizationId?: string;
}

export function UserList({ users, onEdit, onDelete, onAddNew, onResendConfirmation, organizationId }: UserListProps) {
  const { data: accessProfiles } = useQuery<AccessProfile[]>({
    queryKey: ['access-profiles'],
    queryFn: getAccessProfiles,
  });

  const getAccessProfileName = (profileId: string) => {
    return accessProfiles?.find(profile => profile.id === profileId)?.name || 'Unknown';
  };

  const isConfirmationExpired = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return now - createdTime > EMAIL_CONFIRMATION_EXPIRATION_MS;
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>;
      }
    },
    {
      accessorKey: "full_name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original
        return <div className="capitalize">{ user.role}</div>;
      }
    },
    {
      accessorKey: "access_profile_id",
      header: "Access Profile",
      cell: ({ row }) => {
        const user = row.original
        const profileId = user.access_profile_id;
        const profileName = getAccessProfileName(profileId);
        const isOwner = user.id === organizationId
        return <div className="capitalize">{isOwner ? "--" : profileName}</div>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        const status = user.status;
        const isExpired = status === 'pending' && isConfirmationExpired(user.created_at);
        
        return (
          <div className="flex items-center gap-2">
            <div className={`capitalize ${status === 'active' ? 'text-green-500' : 'text-orange-500'}`}>
              {status === 'active' ? 'Active' : "Pending Email Confirmation"}
            </div>
            {isExpired && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => user.email && onResendConfirmation(user.email)}
              >
                <Mail className="h-4 w-4 mr-1" />
                Resend
              </Button>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isOrganizationOwner = user.id === organizationId;
        
        return (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={isOrganizationOwner} onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isOrganizationOwner} onClick={() => onDelete(user.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={users} 
      onAddNew={onAddNew}
    />
  );
} 