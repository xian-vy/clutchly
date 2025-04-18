'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SEX_COLORS, STATUS_COLORS, YES_NO_COLORS } from "@/lib/constants/colors";
import { Reptile } from "@/lib/types/reptile";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Filter, MapPin, MoreHorizontal, Star, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { ReptileFilterDialog, ReptileFilters } from "./ReptileFilterDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extended Reptile type with species_name and morph_name
interface EnrichedReptile extends Reptile {
  species_name: string;
  morph_name: string;
  location_label?: string;
}

interface ReptileListProps {
  reptiles: EnrichedReptile[];
  onEdit?: (reptile: EnrichedReptile) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function ReptileList({ 
  reptiles, 
  onEdit, 
  onDelete, 
  onAddNew,

}: ReptileListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ReptileFilters>({});

  // Apply filters to the reptiles list
  const filteredReptiles = useMemo(() => {
    return reptiles.filter(reptile => {
      // Species filter
      if (filters.species?.length && !filters.species.includes(reptile.species_id)) {
        return false;
      }
      
      // Morph filter
      if (filters.morphs?.length && !filters.morphs.includes(reptile.morph_id)) {
        return false;
      }
      
      // Sex filter
      if (filters.sex?.length && !filters.sex.includes(reptile.sex)) {
        return false;
      }
      
      // Status filter
      if (filters.status?.length && !filters.status.includes(reptile.status)) {
        return false;
      }
      
      // Breeder filter
      if (filters.isBreeder !== null && filters.isBreeder !== undefined) {
        if (filters.isBreeder !== !!reptile.is_breeder) {
          return false;
        }
      }
      
      // Has notes filter
      if (filters.hasNotes !== null && filters.hasNotes !== undefined) {
        const hasNotes = !!(reptile.notes && reptile.notes.length > 0);
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }
      
      // Weight range filter
      if (filters.weightRange) {
        const [min, max] = filters.weightRange;
        if (reptile.weight < min || reptile.weight > max) {
          return false;
        }
      }
      
      // Acquisition date range filter
      if (filters.acquisitionDateRange) {
        const [startDate, endDate] = filters.acquisitionDateRange;
        if (startDate && reptile.acquisition_date < startDate) {
          return false;
        }
        if (endDate && reptile.acquisition_date > endDate) {
          return false;
        }
      }
      
      // Hatch date range filter
      if (filters.hatchDateRange && reptile.hatch_date) {
        const [startDate, endDate] = filters.hatchDateRange;
        if (startDate && reptile.hatch_date < startDate) {
          return false;
        }
        if (endDate && reptile.hatch_date > endDate) {
          return false;
        }
      }
      
      // Visual traits filter
      if (filters.visualTraits?.length && reptile.visual_traits) {
        const hasMatchingTrait = filters.visualTraits.some(trait => 
          reptile.visual_traits?.includes(trait)
        );
        if (!hasMatchingTrait) {
          return false;
        }
      }
      
      // Het traits filter
      if (filters.hetTraits?.length && reptile.het_traits) {
        const hasMatchingTrait = filters.hetTraits.some(trait => 
          reptile.het_traits?.some(hetTrait => hetTrait.trait === trait)
        );
        if (!hasMatchingTrait) {
          return false;
        }
      }
      
      return true;
    });
  }, [reptiles, filters]);
  
  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.species?.length) count++;
    if (filters.morphs?.length) count++;
    if (filters.sex?.length) count++;
    if (filters.status?.length) count++;
    if (filters.isBreeder !== null && filters.isBreeder !== undefined) count++;
    if (filters.hasNotes !== null && filters.hasNotes !== undefined) count++;
    if (filters.weightRange) count++;
    if (filters.acquisitionDateRange) count++;
    if (filters.hatchDateRange) count++;
    if (filters.visualTraits?.length) count++;
    if (filters.hetTraits?.length) count++;
    return count;
  }, [filters]);

  const columns: ColumnDef<EnrichedReptile>[] = [
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
      accessorKey: "species_name",
      header: "Species",
    },
    {
      accessorKey: "morph_name",
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
            className={`${SEX_COLORS[sex.toLowerCase() as keyof typeof SEX_COLORS]} capitalize`}
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
            className={`${STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS]} capitalize`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_breeder",
      header: "Breeder",
      cell: ({ row }) => {
        const is_breeder = row.getValue("is_breeder") 
        const label = is_breeder  ? "Yes" : "No";
        return (
          <Badge
            variant="custom"
            className={`${YES_NO_COLORS[label.toLowerCase() as keyof typeof YES_NO_COLORS]} capitalize`}
          >
            {label}
          </Badge>
        );
      },
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const reptile = row.original;
        const hasLocation = !!reptile.location_id && !!reptile.location_label;
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <MapPin className={`h-4 w-4 mr-1 ${hasLocation ? 'text-green-500' : 'text-gray-300'}`} />
                  {hasLocation ? (
                    <span className="text-xs truncate">
                      {reptile.location_label}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not assigned</span>
                  )}
                </div>
              </TooltipTrigger>
              {hasLocation && (
                <TooltipContent>
                  <p>{reptile.location_label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      id: "notes",
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string | null;
        const label = notes && notes.length > 0 ? "yes" : "no";
        return (
          <Badge
            variant="custom"
            className={`${YES_NO_COLORS[label.toLowerCase() as keyof typeof YES_NO_COLORS]} capitalize`}
          >
            {label}
          </Badge>
        );
      }
    },
    {
      accessorKey: "acquisition_date",
      header: "Acquired",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reptile = row.original;
        return (
          <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem >
                <Star className="mr-2 h-4 w-4" />
                Mark as Favorite
              </DropdownMenuItem>
              <DropdownMenuItem >
                <Eye className="mr-2 h-4 w-4" />
                 Full Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(reptile)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(reptile.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
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
        data={filteredReptiles} 
        onAddNew={onAddNew} 
        filterButton={<CustomFilterButton />}
      />
      
      <ReptileFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </>
  );
}