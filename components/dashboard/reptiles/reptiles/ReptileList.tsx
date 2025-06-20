'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {  STATUS_COLORS, YES_NO_COLORS } from "@/lib/constants/colors";
import { Reptile } from "@/lib/types/reptile";
import { ColumnDef } from "@tanstack/react-table";
import { CircleHelp, Edit, Eye, Filter, MapPin, Mars, MoreHorizontal, Printer, SquarePen, Trash, Venus } from "lucide-react";
import { useMemo, useState } from "react";
import { ReptileFilterDialog, ReptileFilters } from "./ReptileFilterDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImportReptileDialog } from "./ImportReptileDialog";
import { ReptileDetailsDialog } from "./ReptileDetailsDialog";
import { generateReptilePDF } from "@/components/dashboard/reptiles/reptiles/details/pdfGenerator";
import { getReptileDetails } from "@/app/api/reptiles/reptileDetails";
import { formatChartAmount, getSpeciesAbbreviation } from "@/lib/utils";
import { Organization } from "@/lib/types/organizations";
import { format } from "date-fns";
import { BatchUpdateDialog } from "./BatchUpdateDialog";

export interface EnrichedReptile extends Reptile {
  species_name: string;
  morph_name: string;
  location_label?: string;
}

interface ReptileListProps {
  reptiles: EnrichedReptile[];
  onEdit?: (reptile: EnrichedReptile) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  onImportSuccess : () => void;
  isOwner: boolean;
  organization: Organization | undefined
}

export function ReptileList({ 
  reptiles, 
  onEdit, 
  onDelete, 
  onAddNew,
  onImportSuccess,
  isOwner,
  organization
}: ReptileListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ReptileFilters>({});
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedReptile, setSelectedReptile] = useState<EnrichedReptile>({} as EnrichedReptile)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedReptiles, setSelectedReptiles] = useState<EnrichedReptile[]>([]);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  // Controlled row selection for DataTable
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Apply filters to the reptiles list
  const filteredReptiles = useMemo(() => {
    return reptiles.filter(reptile => {
      // Species filter
      if (filters.species?.length && !filters.species.includes(reptile.species_id.toString())) {
        return false;
      }
      
      // Morph filter
      if (filters.morphs?.length && !filters.morphs.includes(reptile.morph_id.toString())) {
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
       // Age filter
      if (filters.ageInMonths && reptile.hatch_date) {
        const [minMonths, maxMonths] = filters.ageInMonths;
        const hatchDate = new Date(reptile.hatch_date);
        const today = new Date();
        const ageInMonths = (today.getFullYear() - hatchDate.getFullYear()) * 12 + 
          (today.getMonth() - hatchDate.getMonth());
        
        // Handle case for less than a month
        if (minMonths === 0 && ageInMonths === 0) {
          const daysSinceHatch = Math.floor((today.getTime() - hatchDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceHatch > 30) return false;
        } else if (ageInMonths < minMonths || ageInMonths > maxMonths) {
          return false;
        }
      }
      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        const price = reptile.price;
        if (price === null || price < min || price > max) return false;
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
    if (filters.priceRange) count++;

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
      accessorKey: "reptile_code",
      header: "Code",
      cell: ({ row }) => {
        const reptile = row.original
        return <div className="text-left">{reptile.reptile_code}</div>; 
      }
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const reptile = row.original;
        return (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
                <div className="mt-0.5">
                    {reptile.sex === 'male' ? (
                      <Mars className="h-4 w-4 text-blue-400 shrink-0"/>
                    ) : reptile.sex === 'female' ? (
                      <Venus className="h-4 w-4 text-red-500 shrink-0"/>
                    ) :(
                      <CircleHelp className="h-4 w-4 text-muted-foreground shrink-0"/>
                    )}
                </div>
                <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px] 3xl:!max-w-[160px]">
                 {reptile.name || 'Unknown'}
                </p>
            </TooltipTrigger>
            <TooltipContent>
                <p>{reptile.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return (
          <p>{formatChartAmount(price || 0)}</p>
        );
      },
    },
    {
      accessorKey: "species_name",
      header: "Species",
      cell: ({ row }) => {
        const speciesName = row.getValue("species_name") as string;
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
      accessorKey: "morph_name",
      header: "Morph",
      cell: ({ row }) => {
        const morphName = row.getValue("morph_name") as string;
 
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
      accessorKey: "hatch_date",
      header: "Hatch",
      cell: ({ row }) => {
        const hatch = row.getValue("hatch_date") as string;
        const label = hatch ? format(new Date(hatch), 'MM/yy') : '--';
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[85px]">
                  {label}
              </TooltipTrigger>
              <TooltipContent>
                  <p>{hatch ? format(new Date(hatch), 'MMM d, yyyy') : "Not Set"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
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
                  {hasLocation &&<MapPin className={`h-4 w-4 mr-1 ${hasLocation ? 'text-primary' : 'text-gray-300'}`} />}
                  {hasLocation ? (
                    <span className="text-xs truncate w-[100px]">
                      {reptile.location_label}
                    </span>
                  ) : (
                    <span className="text-xs">--</span>
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
      id: "actions",
      cell: ({ row }) => {
        const reptile = row.original;
        return (
          <>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={()=>{
                setSelectedReptile(reptile);
                setDetailsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
 
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={()=>{
                  setSelectedReptile(reptile);
                  setDetailsDialogOpen(true);
                }} >
                  <Eye className="mr-2 h-4 w-4" />
                   Full Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={isPrinting}
                  onClick={async () => {
                    try {
                      setIsPrinting(true);
                      // Get detailed reptile data for PDF
                      const detailedReptile = await getReptileDetails(reptile.id);
                      const sireDetails = reptiles.find(r => r.id === reptile.sire_id);
                      const damDetails = reptiles.find(r => r.id === reptile.dam_id);
                      // Generate and download PDF
                      await generateReptilePDF(detailedReptile, sireDetails as EnrichedReptile, damDetails as EnrichedReptile,organization);
                    } catch (error) {
                      console.error("Error generating PDF:", error);
                    } finally {
                      setIsPrinting(false);
                    }
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print PDF
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
          </div>
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

  // Batch update button
  const batchActions = (
    <Button
      variant="default"
      size="sm"
      onClick={() => setIsBatchDialogOpen(true)}
      disabled={selectedReptiles.length === 0}
    >
      Edit Selected ({selectedReptiles.length})
      <SquarePen className="w-4 h-4" />
    </Button>
  );

  return (
    <>
      <DataTable 
        columns={columns} 
        data={filteredReptiles} 
        onAddNew={onAddNew} 
        filterButton={<CustomFilterButton />}
        onImport={() => setIsImportDialogOpen(true)}
        isOwner={isOwner}
        onSelectionChange={setSelectedReptiles}
        batchActions={batchActions}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      
      <ReptileFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
      
      <ImportReptileDialog 
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={onImportSuccess}
      />

      <ReptileDetailsDialog
        reptile={selectedReptile}
        reptiles={reptiles}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <BatchUpdateDialog
        open={isBatchDialogOpen}
        onOpenChange={setIsBatchDialogOpen}
        reptiles={selectedReptiles}
        onSuccess={() => {
          setIsBatchDialogOpen(false);
          setSelectedReptiles([]);
          setRowSelection({}); 
          onImportSuccess(); 
        }}
      />
    </>
  );
}