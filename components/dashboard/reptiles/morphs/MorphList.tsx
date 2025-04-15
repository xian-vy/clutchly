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
  onDownload?: () => void;
}

export function MorphList({ morphs, onEdit, onDelete,onAddNew,onDownload }: MorphListProps) {
  const columns: ColumnDef<MorphWithSpecies>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>; 
      }
    },
    {
      accessorKey: "name",
      header: "Morph",
    },
    {
      accessorKey: "species.name",
      header: "Species",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const morph = row.original;
        const isglobal = morph.is_global
        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              disabled={isglobal}
              size="icon"
              onClick={() => onEdit?.(morph)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button 
              disabled={isglobal}
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(morph.id.toString())}
            >
              <Trash strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={morphs} onAddNew={onAddNew} onDownload={onDownload} />;
}