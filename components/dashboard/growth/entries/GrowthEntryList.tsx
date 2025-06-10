'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { GrowthEntry } from "@/lib/types/growth";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Edit, Filter, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { GrowthFilterDialog, GrowthFilters } from "./GrowthFilterDialog";
import { YES_NO_COLORS } from "@/lib/constants/colors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpeciesAbbreviation } from "@/lib/utils";

interface GrowthEntryListProps {
  growthEntries: GrowthEntry[];
  onEdit?: (growthEntry: GrowthEntry) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  filters: GrowthFilters;
  onFiltersChange: (filters: GrowthFilters) => void;
}

export function GrowthEntryList({ 
  growthEntries, 
  onEdit, 
  onDelete, 
  onAddNew,
  filters,
  onFiltersChange
}: GrowthEntryListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Apply filters to the growth entries list
  const filteredGrowthEntries = useMemo(() => {
    return growthEntries.filter(entry => {
      // Weight range filter
      if (filters.weightRange) {
        const [min, max] = filters.weightRange;
        if (entry.weight < min || entry.weight > max) {
          return false;
        }
      }

      // Length range filter
      if (filters.lengthRange) {
        const [min, max] = filters.lengthRange;
        if (entry.length < min || entry.length > max) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const [startDate, endDate] = filters.dateRange;
        const entryDate = new Date(entry.date);
        if (entryDate < new Date(startDate)) {
          return false;
        }
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // End of day
        if (entryDate > endDateTime) {
          return false;
        }
      }

      // Has notes filter
      if (filters.hasNotes !== null && filters.hasNotes !== undefined) {
        const hasNotes = !!(entry.notes && entry.notes.length > 0);
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }

      // Has attachments filter
      if (filters.hasAttachments !== null && filters.hasAttachments !== undefined) {
        const hasAttachments = entry.attachments.length > 0;
        if (filters.hasAttachments !== hasAttachments) {
          return false;
        }
      }

      return true;
    });
  }, [growthEntries, filters]);

  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    // Only count weight range if it's not default value
    if (filters.weightRange) {
      const [min, max] = filters.weightRange;
      if (min > 0 || max < 1000) count++;
    }
    
    // Only count length range if it's not default value
    if (filters.lengthRange) {
      const [min, max] = filters.lengthRange;
      if (min > 0 || max < 200) count++;
    }
    
    // Date range checks both start and end dates
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) count++;
    
    // Boolean filters
    if (filters.hasNotes !== null && filters.hasNotes !== undefined) count++;
    if (filters.hasAttachments !== null && filters.hasAttachments !== undefined) count++;
    
    return count;
  }, [filters]);

  const columns: ColumnDef<GrowthEntry>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>;
      }
    },
    {
      accessorKey: "reptile",
      header: "Reptile",
      cell: ({ row }) => {
        const reptile = row.getValue("reptile") as number;
        return (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
                <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px] xl:max-w-[150px] 2xl:max-w-[180px]">{reptile}</p>
            </TooltipTrigger>
            <TooltipContent>
                <p>{reptile}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "morph",
      header: "Morph",
      cell: ({ row }) => {
        const morphName = row.getValue("morph") as string;
 
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[85px]">
                {morphName}
              </TooltipTrigger>
              <TooltipContent>
                <p>{morphName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: "species",
      header: "Species",
      cell: ({ row }) => {
        const speciesName = row.getValue("species") as string;
        // Convert species name to abbreviation
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {getSpeciesAbbreviation(speciesName)}
              </TooltipTrigger>
              <TooltipContent>
                <p>{speciesName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
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
        const label = notes && notes.length > 0 ? "yes" : "no";
        return (
              <Badge 
                variant="custom" 
                className={`${YES_NO_COLORS[label.toLowerCase() as keyof typeof YES_NO_COLORS]} capitalize`}>
                 {label}
              </Badge>
        ); 
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

  // Custom filter button for the DataTable
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

  return (
    <>
      <DataTable 
        columns={columns} 
        data={filteredGrowthEntries} 
        onAddNew={onAddNew} 
        filterButton={<CustomFilterButton />}
      />
      
      <GrowthFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={onFiltersChange}
        currentFilters={filters}
      />
    </>
  );
} 