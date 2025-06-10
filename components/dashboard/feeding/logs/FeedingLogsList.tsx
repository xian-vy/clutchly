import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { FeedingEventNormalized } from '../FeedingLogsTab';
import { ColumnDef } from '@tanstack/react-table';
import { FeedingFilterDialog } from './FeedingFilterDialog';
import { FEEDING_STATUS_COLORS } from '@/lib/constants/colors';
import { getSpeciesAbbreviation } from '@/lib/utils';

interface FeedingEventsTableProps {
  events: FeedingEventNormalized[];
  filterStatus: 'all' | 'fed' | 'unfed';
  setFilterStatus: (value: 'all' | 'fed' | 'unfed') => void;
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
}

export function FeedingLogsList({ 
  events,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
}: FeedingEventsTableProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Sort events by date in descending order
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.scheduled_date).getTime();
    const dateB = new Date(b.scheduled_date).getTime();
    return dateB - dateA;
  });

  // Get active filter count for the badge
  const activeFilterCount = (filterStatus !== 'all' ? 1 : 0) + (dateRange?.from ? 1 : 0);

  const columns: ColumnDef<FeedingEventNormalized>[] = [
    {
      accessorKey: "reptile_code",
      header: "Code",
    },
    {
      accessorKey: "reptile_name",
      header: "Reptile",
      cell: ({ row }) => {
        const name = row.getValue("reptile_name") as string;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px] 3xl:!max-w-[160px]">
                {name}
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: "species_name",
      header: "Species",
      cell: ({ row }) => {
        const speciesName = row.getValue("species_name") as string;
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
        const morph = row.getValue("morph_name") as string;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[85px]">
                {morph || '-'}
              </TooltipTrigger>
              <TooltipContent>
                <p>{morph || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: "feeder",
      header: "Feeder",
      cell: ({ row }) => {
        const feeder = row.getValue("feeder") as string;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="truncate max-w-[85px]">
                {feeder || '-'}
              </TooltipTrigger>
              <TooltipContent>
                <p>{feeder || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: "fed",
      header: "Status",
      cell: ({ row }) => {
        const fed = row.getValue("fed") as boolean;
        const label = fed ? "fed" : "unfed";
        return (
          <Badge 
          variant="custom"
          className={`${FEEDING_STATUS_COLORS[label as keyof typeof FEEDING_STATUS_COLORS]} capitalize`} >
            {fed ? "Fed" : "Not Fed"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "scheduled_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("scheduled_date") as string;
        return (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            {format(new Date(date), 'MMM d, yyyy')}
          </div>
        );
      }
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        return (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate max-w-[100px]">
              {notes || '-'}
            </TooltipTrigger>
            <TooltipContent>
              <p>{notes || '-'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        )
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

  return (
    <>
      <DataTable 
        columns={columns} 
        data={sortedEvents}
        filterButton={<CustomFilterButton />}
      />

      <FeedingFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
    </>
  );
} 