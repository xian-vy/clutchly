'use client';

import { Button } from '@/components/ui/button';
import { FeedingScheduleWithTargets } from '@/lib/types/feeding';
import { Plus, Pencil, Trash2, Calendar, Eye, MoreHorizontal } from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FeedingScheduleListProps {
  schedules: FeedingScheduleWithTargets[];
  onEdit: (schedule: FeedingScheduleWithTargets) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewEvents: (schedule: FeedingScheduleWithTargets) => void;
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
      <div className="flex flex-wrap gap-1">
        {locationTargets.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {locationTargets.length} Location{locationTargets.length > 1 ? 's' : ''}
          </Badge>
        )}
        {reptileTargets.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {reptileTargets.length} Reptile{reptileTargets.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table className="border-b">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Recurrence</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No feeding schedules found. Create your first schedule!
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id} className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewEvents(schedule)}
                >
                  <TableCell>
                    <div className="font-medium">{schedule.name}</div>
                    {schedule.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {schedule.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getRecurrenceDisplay(schedule)}</TableCell>
                  <TableCell>{getTargetsDisplay(schedule)}</TableCell>
                  <TableCell>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewEvents(schedule);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Events
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(schedule);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(schedule.id);
                          }}
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
      </CardContent>
    </Card>
  );
} 