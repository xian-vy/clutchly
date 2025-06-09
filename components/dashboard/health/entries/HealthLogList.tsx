'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, MoreHorizontal, Filter } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { HealthLogEntry } from "@/lib/types/health";
import { format } from 'date-fns';
import { useHealthStore } from '@/lib/stores/healthStore';
import { useQuery } from '@tanstack/react-query';
import { HEALTH_STATUS_COLORS, SEVERITY_COLORS } from "@/lib/constants/colors";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { HealthFilterDialog, HealthFilters } from "./HealthFilterDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpeciesAbbreviation } from "@/lib/utils";

interface HealthLogListProps {
  healthLogs: HealthLogEntry[];
  onEdit?: (healthLog: HealthLogEntry) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function HealthLogList({ healthLogs, onEdit, onDelete, onAddNew }: HealthLogListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<HealthFilters>({});

  const { 
    categories, 
    subcategories,
    types,
    getSubcategoriesByCategory,
    getTypesBySubcategory,
    fetchAllData,
    isLoading: healthStoreLoading
  } = useHealthStore();

  // Use TanStack Query only for the initial load of health data
  const { isLoading: healthQueryLoading } = useQuery({
    queryKey: ['health-initial-load'],
    queryFn: async () => {
      // Only fetch if we don't have categories in the store
      if (categories.length === 0) {
        await fetchAllData();
      }
      return categories;
    },
    // Only run once on component mount
    enabled: categories.length === 0,
    // Don't refetch on window focus or reconnect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't consider data stale
    staleTime: Infinity,
  });

  // Apply filters to the health logs list
  const filteredHealthLogs = useMemo(() => {
    return healthLogs.filter(log => {
      // Category filter
      if (filters.category?.length && !filters.category.includes(log.category_id)) {
        return false;
      }

      // Subcategory filter
      if (filters.subcategory?.length && !filters.subcategory.includes(log.subcategory_id)) {
        return false;
      }

      // Type filter
      if (filters.type?.length && log.type_id && !filters.type.includes(log.type_id)) {
        return false;
      }

      // Severity filter
      if (filters.severity?.length && log.severity && !filters.severity.includes(log.severity)) {
        return false;
      }

      // Resolved filter
      if (filters.resolved !== null && filters.resolved !== undefined) {
        if (filters.resolved !== log.resolved) {
          return false;
        }
      }

      // Has notes filter
      if (filters.hasNotes !== null && filters.hasNotes !== undefined) {
        const hasNotes = !!(log.notes && log.notes.length > 0);
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        if (startDate && log.date < startDate) {
          return false;
        }
        if (endDate && log.date > endDate) {
          return false;
        }
      }

      // Has attachments filter
      if (filters.hasAttachments !== null && filters.hasAttachments !== undefined) {
        const hasAttachments = log.attachments.length > 0;
        if (filters.hasAttachments !== hasAttachments) {
          return false;
        }
      }

      return true;
    });
  }, [healthLogs, filters]);

  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category?.length) count++;
    if (filters.subcategory?.length) count++;
    if (filters.type?.length) count++;
    if (filters.severity?.length) count++;
    if (filters.resolved !== null && filters.resolved !== undefined) count++;
    if (filters.hasNotes !== null && filters.hasNotes !== undefined) count++;
    if (filters.dateRange) count++;
    if (filters.hasAttachments !== null && filters.hasAttachments !== undefined) count++;
    return count;
  }, [filters]);

  const columns: ColumnDef<HealthLogEntry>[] = [
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
      accessorKey: 'category_id',
      header: 'Category',
      cell: ({ row }) => {
        const categoryId = row.getValue('category_id') as string;
        const category = categories.find(c => c.id === categoryId);
        return category?.label || '-';
      },
    },
    {
      accessorKey: 'subcategory_id',
      header: 'Subcategory',
      cell: ({ row }) => {
        const subcategoryId = row.getValue('subcategory_id') as string;
        const categoryId = row.original.category_id;
        const subcategory = getSubcategoriesByCategory(categoryId)
          .find(s => s.id === subcategoryId);
        return subcategory?.label || '-';
      },
    },
    {
      accessorKey: 'type_id',
      header: 'Type',
      cell: ({ row }) => {
        const typeId = row.getValue('type_id') as string | null;
        const subcategoryId = row.original.subcategory_id;
        const customTypeLabel = row.original.custom_type_label;
        
        if (typeId === null && customTypeLabel) {
          return customTypeLabel;
        }
        
        const type = getTypesBySubcategory(subcategoryId)
          .find(t => t.id === typeId);
        return type?.label || '-';
      },
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.getValue('severity') as keyof typeof SEVERITY_COLORS;
        return severity ? (
          <Badge variant="custom" 
            className={`capitalize ${SEVERITY_COLORS[severity.toLowerCase() as keyof typeof SEVERITY_COLORS]}`}>
            {severity}
          </Badge>
        ) : '-';
      },
    },
    {
      accessorKey: 'resolved',
      header: 'Status',
      cell: ({ row }) => {
        const resolved = row.getValue('resolved') 
        const label = resolved ? 'Resolved' : 'Ongoing';
        return (
          <Badge 
            variant="custom"
            className={`capitalize ${HEALTH_STATUS_COLORS[label.toLowerCase() as keyof typeof HEALTH_STATUS_COLORS]}`}
          >
            {resolved ? 'resolved' : 'ongoing'}
          </Badge>
        );
      },
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
      id: "actions",
      cell: ({ row }) => {
        const health = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(health)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(health.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const isLoading = healthStoreLoading || healthQueryLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
        data={filteredHealthLogs} 
        onAddNew={onAddNew} 
        filterButton={<CustomFilterButton />}
      />
      
      <HealthFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
        categories={categories}
        subcategories={subcategories}
        types={types}
      />
    </>
  );
} 