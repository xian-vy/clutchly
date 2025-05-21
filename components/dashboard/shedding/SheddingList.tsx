'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { SheddingWithReptile, UpdateSheddingInput } from '@/lib/types/shedding'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { EditSheddingDialog } from './EditSheddingDialog'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Filter } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { SheddingFilterDialog, SheddingFilters } from './SheddingFilterDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

interface Props {
  sheddingRecords: SheddingWithReptile[] | undefined
  isLoading: boolean
  selectedResource: SheddingWithReptile | undefined
  setSelectedResource: (resource: SheddingWithReptile | undefined) => void
  onUpdate: (data: UpdateSheddingInput) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

export function SheddingList({
  sheddingRecords = [],
  isLoading,
  selectedResource,
  setSelectedResource,
  onUpdate,
  onDelete,
}: Props) {
  const [editingShedding, setEditingShedding] = useState<SheddingWithReptile | null>(null)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [filters, setFilters] = useState<SheddingFilters>({})

  // Apply filters to the shedding records
  const filteredRecords = useMemo(() => {
    return sheddingRecords.filter(record => {
      // Completeness filter
      if (filters.completeness?.length && !filters.completeness.includes(record.completeness)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        const shedDate = new Date(record.shed_date);
        if (startDate && shedDate < startDate) {
          return false;
        }
        if (endDate && shedDate > endDate) {
          return false;
        }
      }
      
      // Reptile filter
      if (filters.reptileIds?.length && !filters.reptileIds.includes(record.reptile_id)) {
        return false;
      }
      
      return true;
    });
  }, [sheddingRecords, filters]);

  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.completeness?.length) count++;
    if (filters.dateRange) count++;
    if (filters.reptileIds?.length) count++;
    return count;
  }, [filters]);

  const columns: ColumnDef<SheddingWithReptile>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>;
      }
    },
    {
      accessorKey: "shed_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("shed_date") as string;
        return format(new Date(date), 'MMM d, yyyy');
      }
    },
    {
      accessorKey: "reptile",
      header: "Reptile",
      cell: ({ row }) => {
        const reptile = row.original.reptile;
        return (
          <div>
            {reptile.name}
            {reptile.reptile_code && (
              <span className="ml-2 text-muted-foreground">
                ({reptile.reptile_code})
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "completeness",
      header: "Completeness",
      cell: ({ row }) => {
        const completeness = row.getValue("completeness") as string;
        return (
          <Badge variant="outline">
            {completeness.charAt(0).toUpperCase() + completeness.slice(1)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedResource(record);
                setEditingShedding(record);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedResource(record);
                  setEditingShedding(record);
                }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (confirm('Are you sure you want to delete this shedding record?')) {
                    onDelete(record.id);
                  }
                }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTable 
        columns={columns} 
        data={filteredRecords}
        filterButton={<CustomFilterButton />}
      />

      <SheddingFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
        reptiles={sheddingRecords.map(record => ({
          id: record.reptile_id,
          name: record.reptile.name,
          reptile_code: record.reptile.reptile_code || undefined
        }))}
      />

      {editingShedding && (
        <EditSheddingDialog
          shedding={editingShedding}
          open={!!editingShedding}
          onOpenChange={(open) => {
            if (!open) {
              setEditingShedding(null)
              setSelectedResource(undefined)
            }
          }}
          onSubmit={async (data: UpdateSheddingInput) => {
            if (selectedResource) {
              const success = await onUpdate(data)
              if (success) {
                setEditingShedding(null)
                setSelectedResource(undefined)
              }
            }
          }}
        />
      )}
    </div>
  )
} 