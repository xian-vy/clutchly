'use client';

import { Button } from '@/components/ui/button';
import { Edit, Eye, Filter, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Reptile } from '@/lib/types/reptile';
import { BreedingProject } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { useState, useMemo } from 'react';
import { BreedingFilterDialog, BreedingFilters } from './BreedingFilterDialog';

interface EnrichedBreedingProject extends BreedingProject {
  male_name: string;
  female_name: string;
}

interface BreedingProjectListProps {
  projects: BreedingProject[];
  onEdit: (project: BreedingProject) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (project: BreedingProject) => void;
}



export function BreedingProjectList({
  projects,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails,
}: BreedingProjectListProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<BreedingFilters>({});

  // Fetch reptiles to get parent names
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Create a map of reptile IDs to names for quick lookup
  const reptileMap = new Map<string, string>();
  reptiles.forEach(reptile => {
    reptileMap.set(reptile.id, reptile.name);
  });

  // Enrich projects with parent names
  const enrichedProjects: EnrichedBreedingProject[] = projects.map((project) => ({
    ...project,
    male_name: reptileMap.get(project.male_id) || 'Unknown',
    female_name: reptileMap.get(project.female_id) || 'Unknown',
  }));

  // Apply filters to the breeding projects list
  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter(project => {
      // Species filter
      if (filters.species?.length && !filters.species.includes(project.species_id.toString())) {
        return false;
      }

      // Breeding status filter
      if (filters.breedingStatus?.length && !filters.breedingStatus.includes(project.status)) {
        return false;
      }

      // Start date range filter
      if (filters.startDateRange) {
        const [startDate, endDate] = filters.startDateRange;
        if (startDate && project.start_date < startDate) {
          return false;
        }
        if (endDate && project.start_date > endDate) {
          return false;
        }
      }

      // Hatch date range filter
      if (filters.hatchDateRange && project.expected_hatch_date) {
        const [startDate, endDate] = filters.hatchDateRange;
        if (startDate && project.expected_hatch_date < startDate) {
          return false;
        }
        if (endDate && project.expected_hatch_date > endDate) {
          return false;
        }
      }

      // Has notes filter
      if (filters.hasNotes !== null && filters.hasNotes !== undefined) {
        const hasNotes = !!(project.notes && project.notes.length > 0);
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedProjects, filters]);

  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.species?.length) count++;
    if (filters.breedingStatus?.length) count++;
    if (filters.incubationStatus?.length) count++;
    if (filters.startDateRange) count++;
    if (filters.layDateRange) count++;
    if (filters.hatchDateRange) count++;
    if (filters.eggCountRange) count++;
    if (filters.fertileCountRange) count++;
    if (filters.incubationTempRange) count++;
    if (filters.incubationHumidityRange) count++;
    if (filters.hasNotes !== null && filters.hasNotes !== undefined) count++;
    return count;
  }, [filters]);

  const columns: ColumnDef<EnrichedBreedingProject>[] = [
    {
      header: '#',
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'male_name',
      header: 'Sire',
    },
    {
      accessorKey: 'female_name',
      header: 'Dam',
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
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => {
        const date = row.getValue('start_date') as string;
        return format(new Date(date), 'MMM d, yyyy');
      },
    },
    {
      accessorKey: 'expected_hatch_date',
      header: 'Expected Hatch',
      cell: ({ row }) => {
        const date = row.getValue('expected_hatch_date') as string | null;
        return date ? format(new Date(date), 'MMM d, yyyy') : 'Not set';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(project)}
            >
              <Eye strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(project)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(project.id)}
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
        data={filteredProjects} 
        onAddNew={onAddNew} 
        filterButton={<CustomFilterButton />}
      />
      
      <BreedingFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </>
  );
} 