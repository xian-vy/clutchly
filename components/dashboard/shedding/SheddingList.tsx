'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { SheddingWithReptile, UpdateSheddingInput } from '@/lib/types/shedding'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { EditSheddingDialog } from './EditSheddingDialog'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Filter, MoreHorizontal } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { SheddingFilterDialog, SheddingFilters } from './SheddingFilterDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { SHEDDING_COLORS, YES_NO_COLORS } from '@/lib/constants/colors'
import { getSpeciesAbbreviation } from '@/lib/utils'

interface Props {
  sheddingRecords: SheddingWithReptile[]
  isLoading: boolean
  onUpdate: (data: Partial<UpdateSheddingInput>) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
  onAddNew: () => void
}

export function SheddingList({
  sheddingRecords,
  isLoading,
  onUpdate,
  onDelete,
  onAddNew,
}: Props) {
  const [editingShedding, setEditingShedding] = useState<SheddingWithReptile | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SheddingFilters | null>(null)
  const {species} = useSpeciesStore()

  const filteredRecords = useMemo(() => {
    if (!filters) return sheddingRecords;
    
    return sheddingRecords.filter((record) => {
      // Filter by completeness
      if (filters.completeness?.length && !filters.completeness.includes(record.completeness)) {
        return false
      }

      // Filter by date range
      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange
        const shedDate = new Date(record.shed_date)
        if (startDate && new Date(startDate) > shedDate) {
          return false
        }
        if (endDate && new Date(endDate) < shedDate) {
          return false
        }
      }

      // Filter by species
      if (filters.species?.length) {
        const reptileSpecies = record.reptile.species_id.toString();
        if (!filters.species.includes(reptileSpecies)) {
          return false;
        }
      }

      // Filter by morphs
      if (filters.morphs?.length) {
        const reptileMorphId = record.reptile.morph_id;
        if (!filters.morphs.includes(reptileMorphId)) {
          return false;
        }
      }

      // Filter by notes
      if (filters.hasNotes !== null) {
        const hasNotes = Boolean(record.notes && record.notes.length > 0);
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }

      return true
    })
  }, [sheddingRecords, filters])

  // Get active filter count for the badge
  const activeFilters = useMemo(() => {
    if (!filters) return 0;
    
    let count = 0
    if (filters.completeness?.length) count++
    if (filters.dateRange) count++
    if (filters.species?.length) count++
    if (filters.morphs?.length) count++
    if (filters.hasNotes !== null) count++
    return count
  }, [filters])

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
      accessorKey: "species",
      header: "Species",
      cell: ({ row }) => {
        const reptile = row.original.reptile;
        const speciesName = species.find(species => species.id.toString() === reptile.species_id.toString())?.name || 'Unknown';        return (
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
      accessorKey: "reptile",
      header: "Reptile",
      cell: ({ row }) => {
        const reptile = row.original.reptile;
        return (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
                <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px] xl:max-w-[150px] 2xl:max-w-[180px]">{reptile.name}</p>
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
      accessorKey: "reptile_code",
      header: "Code",
      cell: ({ row }) => {
        const reptile = row.original.reptile;
        return <div className="text-left">{reptile.reptile_code}</div>;
      }
    },
    {
      accessorKey: "completeness",
      header: "Completeness",
      cell: ({ row }) => {
        const completeness = row.getValue("completeness") as string;
        return (
          <Badge variant="outline"
          className={`${SHEDDING_COLORS[completeness.toLowerCase() as keyof typeof SHEDDING_COLORS]} capitalize`}
          >
            {completeness}
          </Badge>
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
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
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
      className="h-8 gap-1"
      onClick={() => setShowFilters(true)}
    >
      <Filter className="h-4 w-4" />
      Filters
      {activeFilters > 0 && (
        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
          {activeFilters}
        </Badge>
      )}
    </Button>
  )

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={filteredRecords}
        filterButton={<CustomFilterButton />}
        onAddNew={onAddNew}
      />

      <SheddingFilterDialog
        open={showFilters}
        onOpenChange={setShowFilters}
        onApplyFilters={(newFilters) => setFilters(Object.keys(newFilters).length ? newFilters : null)}
        currentFilters={filters || {}}
      />

      {editingShedding && (
        <EditSheddingDialog
          shedding={editingShedding}
          open={!!editingShedding}
          onOpenChange={(open) => !open && setEditingShedding(null)}
          onSubmit={async (data) => {
            const success = await onUpdate(data)
            if (success) {
              setEditingShedding(null)
            }
          }}
        />
      )}
    </div>
  )
} 