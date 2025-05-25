'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types/users';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAccessProfiles } from '@/app/api/users/access';
import { AccessProfile } from '@/lib/types/access';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export function UserList({ users, onEdit, onDelete, onAddNew }: UserListProps) {
  const { data: accessProfiles } = useQuery<AccessProfile[]>({
    queryKey: ['access-profiles'],
    queryFn: getAccessProfiles,
  });

  const getAccessProfileName = (profileId: string) => {
    return accessProfiles?.find(profile => profile.id === profileId)?.name || 'Unknown';
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
        const role = row.getValue("role") as string;
        return <div className="capitalize">{role}</div>;
      }
    },
    {
      accessorKey: "access_profile_id",
      header: "Access Profile",
      cell: ({ row }) => {
        const profileId = row.getValue("access_profile_id") as string;
        return getAccessProfileName(profileId);
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(user.id)}>
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