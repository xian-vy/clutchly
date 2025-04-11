'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Morph } from "@/lib/types/morph";

type MorphWithSpecies = Morph & { species: { name: string } }

interface MorphListProps {
  morphs: MorphWithSpecies[];
  onEdit?: (morph: MorphWithSpecies) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function MorphList({ morphs, onEdit, onDelete,onAddNew }: MorphListProps) {
  const columns: ColumnDef<MorphWithSpecies>[] = [
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
    },
    {
      accessorKey: "species.name",
      header: "Species",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const morph = row.original;
        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(morph)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(morph.id)}
            >
              <Trash strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={morphs} onAddNew={onAddNew} />;
} 