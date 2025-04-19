'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Morph } from "@/lib/types/morph";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { MorphFilterDialog, MorphFilters } from "./MorphFilterDialog";
import { Badge } from "@/components/ui/badge";

type MorphWithSpecies = Morph & { species: { name: string } }

interface MorphListProps {
  morphs: MorphWithSpecies[];
  onEdit?: (morph: MorphWithSpecies) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  onDownload?: () => void;
}

export function MorphList({ morphs, onEdit, onDelete, onAddNew, onDownload }: MorphListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<MorphFilters>({});

  // Get unique species for filter options
  const speciesList = useMemo(() => {
    const uniqueSpecies = Array.from(new Set(morphs.map(m => ({ 
      value: m.species.name,
      label: m.species.name 
    }))));
    return uniqueSpecies;
  }, [morphs]);

  // Apply filters to morphs list
  const filteredMorphs = useMemo(() => {
    return morphs.filter(morph => {
      if (filters.species?.length && !filters.species.includes(morph.species.name)) {
        return false;
      }
      if (filters.isGlobal !== null && filters.isGlobal !== undefined) {
        if (filters.isGlobal !== morph.is_global) {
          return false;
        }
      }
      return true;
    });
  }, [morphs, filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.species?.length) count++;
    if (filters.isGlobal !== null && filters.isGlobal !== undefined) count++;
    return count;
  }, [filters]);

  // Custom filter button
  const CustomFilterButton = () => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setIsFilterDialogOpen(true)}
      className="relative"
    >
      <Filter className="h-4 w-4 mr-1" />
      Filter
      {activeFilterCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute text-white rounded-sm -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 font-normal text-[0.65rem]"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
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

  return (
    <>
      <DataTable 
        columns={columns} 
        data={filteredMorphs} 
        onAddNew={onAddNew} 
        onDownload={onDownload}
        filterButton={<CustomFilterButton />}
      />
      
      <MorphFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
        speciesList={speciesList}
      />
    </>
  );
}