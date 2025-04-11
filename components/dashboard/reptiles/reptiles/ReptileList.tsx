'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Reptile } from "@/lib/types/reptile";
import { Badge } from "@/components/ui/badge";
import { SEX_COLORS, STATUS_COLORS } from "@/lib/constants/colors";

interface ReptileListProps {
  reptiles: Reptile[];
  onEdit?: (reptile: Reptile) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function ReptileList({ reptiles, onEdit, onDelete, onAddNew }: ReptileListProps) {
  const columns: ColumnDef<Reptile>[] = [
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
      accessorKey: "species",
      header: "Species",
    },
    {
      accessorKey: "morph",
      header: "Morph",
    },
    {
      accessorKey: "sex",
      header: "Sex",
      cell: ({ row }) => {
        const sex = row.getValue("sex") as keyof typeof SEX_COLORS;
        return (
          <Badge
            variant="custom"
            className={SEX_COLORS[sex.toLowerCase() as keyof typeof SEX_COLORS]}
          >
            {sex}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof STATUS_COLORS;
        return (
          <Badge
            variant="custom"
            className={STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS]}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "hatch_date",
      header: "Hatch",
    },
    {
      accessorKey: "acquisition_date",
      header: "Acquisition",
    },
    {
      id: "notes",
      accessorKey: "notes",
      header: "With Note",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string | null;
        return <div className="text-left">{notes && notes.length > 0 ? "Yes" : "No"}</div>; 
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reptile = row.original;
        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(reptile)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(reptile.id)}
            >
              <Trash strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={reptiles} onAddNew={onAddNew} />;
} 