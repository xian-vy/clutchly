'use client';

import { Button } from '@/components/ui/button';
import { Edit, Eye, Filter, MoreHorizontal, Trash} from 'lucide-react';
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
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from '@/lib/stores/authStore';

interface EnrichedBreedingProject extends BreedingProject {
  male_name: string;
  female_name: string;
  species_name: string;
  male_morph_name: string;
  female_morph_name: string;
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
  const {species} = useSpeciesStore();
  const {morphs} = useMorphsStore();
  const { organization } = useAuthStore()

  // Fetch reptiles to get parent names
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: async () => {
  if (!organization) return [];
   return getReptiles(organization) 
},
  });

  // Create a map of reptile IDs to names for quick lookup
  const reptileMap = new Map<string, string>();
  reptiles.forEach(reptile => {
    reptileMap.set(reptile.id, reptile.name);
  });

  // Enrich projects with parent names
  const enrichedProjects: EnrichedBreedingProject[] = projects.map((project) => {
    const maleReptile = reptiles.find(r => r.id === project.male_id);
    const femaleReptile = reptiles.find(r => r.id === project.female_id);
    
    return {
      ...project,
      male_name: reptileMap.get(project.male_id) || 'Unknown',
      female_name: reptileMap.get(project.female_id) || 'Unknown',
      species_name: species.find(s => s.id.toString() === project.species_id.toString())?.name || 'Unknown',
      male_morph_name: morphs.find(m => m.id.toString() === maleReptile?.morph_id.toString())?.name || 'Unknown',
      female_morph_name: morphs.find(m => m.id.toString() === femaleReptile?.morph_id.toString())?.name || 'Unknown',
    };
  });

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
    
    // Array filters - only count if there are actually items selected
    if (filters.species?.length) count++;
    if (filters.breedingStatus?.length) count++;
    
    // Date ranges - only count if at least one date is set
    if (filters.startDateRange && (filters.startDateRange[0] || filters.startDateRange[1])) count++;
    if (filters.hatchDateRange && (filters.hatchDateRange[0] || filters.hatchDateRange[1])) count++;
    
    // Boolean filters - only count if true
    if (filters.hasNotes === true) count++;
    
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
      header: 'Project',
    },
    {
      accessorKey: "species_name",
      header: "Species",
      cell: ({ row }) => {
        const speciesName = row.getValue("species_name") as string;
        // Convert species name to abbreviation
        const getSpeciesAbbreviation = (name: string) => {
          return name.split(' ')
            .map(word => word[0]?.toUpperCase())
            .join('');
        };
        
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
      header: "Pairing",
      cell: ({ row }) => {
        const male_morph_name = row.original.male_morph_name;
        const female_morph_name = row.original.female_morph_name;
        return (
          <div className="text-left">
            <span className="font-medium text-blue-600 dark:text-blue-500">{male_morph_name}</span>
            <span className='text-muted-foreground mx-1'> x </span>
            <span className="font-medium text-pink-600 dark:text-pink-500">{female_morph_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "male_name",
      header: "Sire (M)",
      cell: ({ row }) => {
        const male_name = row.getValue("male_name") as number;
        return (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
                <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] 2xl:max-w-[150px]">{male_name}</p>
            </TooltipTrigger>
            <TooltipContent>
                <p>{male_name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "female_name",
      header: 'Dam (F)',
      cell: ({ row }) => {
        const female_name = row.getValue("female_name") as number;
        return (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
                <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px] 3xl:max-w-[150px]">{female_name}</p>
            </TooltipTrigger>
            <TooltipContent>
                <p>{female_name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      },
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => {
        const date = row.getValue('start_date') as string;
        return  (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                  <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px] 3xl:max-w-[150px]">
                    {format(new Date(date), 'MM/yy') }
                  </p>
              </TooltipTrigger>
              <TooltipContent>
                  <p>{format(new Date(date), 'MMM d, yyyy') }</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'expected_hatch_date',
      header: 'Hatch Date',
      cell: ({ row }) => {
        const date = row.getValue('expected_hatch_date') as string | null;
        const label = date ? format(new Date(date), 'MM/yy') : '--';
        return  (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                  <p className="mt-1 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px] 3xl:max-w-[150px]">
                    {label}
                  </p>
              </TooltipTrigger>
              <TooltipContent>
                  <p>{date ? format(new Date(date), 'MMM d, yyyy') : "Not Set" }</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>         
        )
      },
    },
    {
      accessorKey: 'clutchCount',
      header: 'Clutches',
    },
    {
      accessorKey: 'hatchlingCount',
      header: 'Hatchlings',
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof STATUS_COLORS;
        return (
          <Badge
            variant="custom"
            className={`capitalize ${STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS]}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewDetails(project)}
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
                <DropdownMenuItem   onClick={() => onViewDetails(project)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Project Details
                </DropdownMenuItem>
                <DropdownMenuItem  onClick={() => onEdit(project)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem   onClick={() => onDelete(project.id)}>
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