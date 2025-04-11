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
      header: "Name",
    },
    {
      accessorKey: "scientific_name",
      header: "Scientific Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const speciesItem = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(speciesItem)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(speciesItem.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={species} onAddNew={onAddNew} />;
} 