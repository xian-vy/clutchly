'use client';

import { Button } from '@/components/ui/button';
import { FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { Plus, Pencil, Trash2, Calendar, MoreHorizontal, MapPin, Footprints } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeedingScheduleListProps {
  schedules: FeedingScheduleWithTargets[];
  onEdit: (schedule: FeedingScheduleWithTargets) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewEvents?: (schedule: FeedingScheduleWithTargets) => void;
}

export function FeedingScheduleList({
  schedules,
  onEdit,
  onDelete,
  onAddNew,
  onViewEvents,
}: FeedingScheduleListProps) {
  // Format recurrence display
  const getRecurrenceDisplay = (schedule: FeedingScheduleWithTargets) => {
    switch (schedule.recurrence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        if (!schedule.custom_days || schedule.custom_days.length === 0) {
          return 'Custom';
        }
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = schedule.custom_days.sort().map(day => dayNames[day]);
        return `Custom (${days.join(', ')})`;
    }
  };

  // Format targets display
  const getTargetsDisplay = (schedule: FeedingScheduleWithTargets) => {
    const locationTargets = schedule.targets.filter(
      (target) => target.target_type === 'location'
    );
    const reptileTargets = schedule.targets.filter(
      (target) => target.target_type === 'reptile'
    );

    return (
      <div className="flex flex-col gap-1.5">
        {locationTargets.length > 0 && (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {locationTargets.map((target, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-default">
                        {target.location_label || "Unknown location"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Location: {target.location_label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
        {reptileTargets.length > 0 && (
          <div className="flex items-start gap-1.5">
            <Footprints className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {reptileTargets.map((target, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-default">
                        {target.reptile_name || "Unknown reptile"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reptile: {target.reptile_name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="border-b">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 px-4 md:px-6">Name</TableHead>
                <TableHead className="py-3 px-4 md:px-6">Recurrence</TableHead>
                <TableHead className="py-3 px-4 md:px-6">Targets</TableHead>
                <TableHead className="py-3 px-4 md:px-6">Dates</TableHead>
                <TableHead className="w-[100px] py-3 px-4 md:px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    No feeding schedules found. Create your first schedule!
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id} className="hover:bg-muted/50">
                    <TableCell className="py-3 px-4 md:px-6">
                      <div className="font-medium">{schedule.name}</div>
                      {schedule.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {schedule.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 md:px-6">{getRecurrenceDisplay(schedule)}</TableCell>
                    <TableCell className="py-3 px-4 md:px-6">{getTargetsDisplay(schedule)}</TableCell>
                    <TableCell className="py-3 px-4 md:px-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>
                          {format(new Date(schedule.start_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {schedule.end_date && (
                        <div className="text-xs text-muted-foreground">
                          Until {format(new Date(schedule.end_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-3 px-4 md:px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewEvents && (
                            <DropdownMenuItem 
                              onClick={() => onViewEvents(schedule)}
                              className="cursor-pointer"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              View Events
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => onEdit(schedule)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(schedule.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {schedules.length === 0 && (
          <div className="flex justify-center p-6">
            <Button
              onClick={onAddNew}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Feeding Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 