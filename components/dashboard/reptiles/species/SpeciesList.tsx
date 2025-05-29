'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash, Filter } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Species } from "@/lib/types/species";
import { useMemo, useState } from "react";
import { SpeciesFilterDialog, SpeciesFilters } from "./SpeciesFilterDialog";
import { Badge } from "@/components/ui/badge";

interface SpeciesListProps {
  species: Species[];
  onEdit?: (species: Species) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function SpeciesList({ species, onEdit, onDelete, onAddNew }: SpeciesListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<SpeciesFilters>({});

  // Apply filters to species list
  const filteredSpecies = useMemo(() => {
    return species.filter(speciesItem => {
      if (filters.careLevel && speciesItem.care_level !== filters.careLevel) {
        return false;
      }
      if (filters.isGlobal !== null && filters.isGlobal !== undefined) {
        if (filters.isGlobal !== speciesItem.is_global) {
          return false;
        }
      }
      return true;
    });
  }, [species, filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.careLevel) count++;
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
      header: "Created by",
      accessorKey: "is_global",
      cell: ({ row }) => {
        const is_global = row.original.is_global
        const createdby = is_global ? "System" : "User"
        return <div className="text-left">{createdby}</div>; 
      }
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
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              disabled={isglobal}
              onClick={() => onDelete?.(speciesItem.id.toString())}
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
        data={filteredSpecies} 
        onAddNew={onAddNew}
        filterButton={<CustomFilterButton />}
      />
      
      <SpeciesFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </>
  );
}