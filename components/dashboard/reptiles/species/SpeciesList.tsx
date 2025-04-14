'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Species } from "@/lib/types/species";

interface SpeciesListProps {
  species: Species[];
  onEdit?: (species: Species) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function SpeciesList({ species, onEdit, onDelete, onAddNew }: SpeciesListProps) {
  const columns: ColumnDef<Species>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>; 
      }
    },
    {
      accessorKey: "name",
      header: "Species",
    },
    {
      accessorKey: "scientific_name",
      header: "Scientific Name",
    },
    {
      accessorKey: "care_level",
      header: "Care Level",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const speciesItem = row.original;
        const isglobal = speciesItem.is_global

        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon"
              disabled={isglobal}
              onClick={() => onEdit?.(speciesItem)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              disabled={isglobal}
              onClick={() => onDelete?.(speciesItem.id.toString())}
            >
              <Trash strokeWidth={1.5} className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={species} onAddNew={onAddNew} />;
} 