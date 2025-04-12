'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { GrowthEntry } from "@/lib/types/growth";
import { format } from 'date-fns';
import { useGrowthStore } from '@/lib/stores/growthStore';
import { useQuery } from '@tanstack/react-query';
import { useResource } from '@/lib/hooks/useResource';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';

interface GrowthEntryListProps {
  growthEntries: GrowthEntry[];
  onEdit?: (growthEntry: GrowthEntry) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function GrowthEntryList({ growthEntries, onEdit, onDelete, onAddNew }: GrowthEntryListProps) {
  const { 
    fetchEntries,
    isLoading: growthStoreLoading
  } = useGrowthStore();

  // Use TanStack Query only for the initial load of growth data
  const { isLoading: growthQueryLoading } = useQuery({
    queryKey: ['growth-initial-load'],
    queryFn: async () => {
      await fetchEntries();
      return true;
    },
    // Only run once on component mount
    enabled: true,
    // Don't refetch on window focus or reconnect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't consider data stale
    staleTime: Infinity,
  });

  // Use the useResource hook to fetch reptiles
  const { 
    resources: reptiles, 
    isLoading: isReptilesLoading 
  } = useResource<Reptile, any>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  const columns: ColumnDef<GrowthEntry>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return format(new Date(date), 'MMM d, yyyy');
      },
    },
    {
      accessorKey: 'reptile_id',
      header: 'Reptile',
      cell: ({ row }) => {
        const reptileId = row.getValue('reptile_id') as string;
        const reptile = reptiles.find(r => r.id === reptileId);
        return reptile?.name || '-';
      },
    },
    {
      accessorKey: 'weight',
      header: 'Weight (g)',
      cell: ({ row }) => {
        const weight = row.getValue('weight') as number;
        return weight.toFixed(1);
      },
    },
    {
      accessorKey: 'length',
      header: 'Length (cm)',
      cell: ({ row }) => {
        const length = row.getValue('length') as number;
        return length.toFixed(1);
      },
    },
    {
      id: 'notes',
      accessorKey: 'notes',
      header: 'With Note',
      cell: ({ row }) => {
        const notes = row.getValue('notes') as string | null;
        return <div className="text-left">{notes && notes.length > 0 ? "Yes" : "No"}</div>; 
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const growthEntry = row.original;
        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(growthEntry)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(growthEntry.id)}
            >
              <Trash2 strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const isLoading = growthStoreLoading || growthQueryLoading || isReptilesLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <DataTable columns={columns} data={growthEntries} onAddNew={onAddNew} />;
} 