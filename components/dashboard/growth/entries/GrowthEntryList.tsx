'use client';

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { GrowthEntry } from "@/lib/types/growth";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Edit, Trash2 } from "lucide-react";

interface GrowthEntryListProps {
  growthEntries: GrowthEntry[];
  onEdit?: (growthEntry: GrowthEntry) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function GrowthEntryList({ growthEntries, onEdit, onDelete, onAddNew }: GrowthEntryListProps) {
  

  const columns: ColumnDef<GrowthEntry>[] = [
    {
      accessorKey: 'reptile',
      header: 'Reptile', 
    },
    {
      accessorKey:'morph',
      header: 'Morph', 
    },
    {
      accessorKey:'species',
      header: 'Species', 
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return format(new Date(date), 'MMM d, yyyy');
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



  return <DataTable columns={columns} data={growthEntries} onAddNew={onAddNew} />;
} 