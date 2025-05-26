'use client';

import { AccessProfileWithControls } from '@/lib/types/access';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface AccessProfileListProps {
  profiles: AccessProfileWithControls[];
  onEdit: (profile: AccessProfileWithControls) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export function AccessProfileList({ profiles, onEdit, onDelete, onAddNew }: AccessProfileListProps) {
  const columns: ColumnDef<AccessProfileWithControls>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>;
      }
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return <div className="text-muted-foreground">{description || '-'}</div>;
      }
    },
    {
      accessorKey: "access_controls",
      header: "Access Controls",
      cell: ({ row }) => {
        const controls = row.getValue("access_controls") as AccessProfileWithControls['access_controls'];
        return <div>{controls?.length ?? 0} controls</div>;
      }
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <div>{format(new Date(date), 'MMM d, yyyy')}</div>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(profile)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(profile.id)}>
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
      data={profiles} 
      onAddNew={onAddNew}
    />
  );
} 