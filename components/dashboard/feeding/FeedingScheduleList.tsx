'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { format } from 'date-fns';
import { Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface FeedingScheduleListProps {
  schedules: FeedingScheduleWithTargets[];
  onEdit: (schedule: FeedingScheduleWithTargets) => void;
  onDelete: (id: string) => void;
  onViewEvents?: (schedule: FeedingScheduleWithTargets) => void;
}

export function FeedingScheduleList({
  schedules,
  onEdit,
  onDelete,
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

  // Function to render target details
  function renderTargets(targets: FeedingTargetWithDetails[]) {
    if (!targets || targets.length === 0) return 'No targets';
    
    // Group targets by type
    const reptileTargets = targets.filter(t => t.target_type === 'reptile');
    const locationTargets = targets.filter(t => t.target_type === 'location');
    const roomTargets = targets.filter(t => t.target_type === 'room');
    const rackTargets = targets.filter(t => t.target_type === 'rack');
    const levelTargets = targets.filter(t => t.target_type === 'level');
    
    const targetSections = [];
    
    // Add reptiles section if there are reptile targets
    if (reptileTargets.length > 0) {
      targetSections.push(
        <div key="reptiles" className="mb-1">
          <span className="font-medium">Reptiles: </span>
          <span>{reptileTargets.map(t => t.reptile_name).join(', ')}</span>
        </div>
      );
    }
    
    // Add locations section if there are location targets
    if (locationTargets.length > 0) {
      targetSections.push(
        <div key="locations" className="mb-1">
          <span className="font-medium">Enclosures: </span>
          <span>{locationTargets.map(t => t.location_label).join(', ')}</span>
        </div>
      );
    }
    
    // Add rooms section if there are room targets
    if (roomTargets.length > 0) {
      targetSections.push(
        <div key="rooms" className="mb-1">
          <span className="font-medium">Rooms: </span>
          <span>{roomTargets.map(t => t.room_name).join(', ')}</span>
        </div>
      );
    }
    
    // Add racks section if there are rack targets
    if (rackTargets.length > 0) {
      targetSections.push(
        <div key="racks" className="mb-1">
          <span className="font-medium">Racks: </span>
          <span>{rackTargets.map(t => t.rack_name).join(', ')}</span>
        </div>
      );
    }
    
    // Add levels section if there are level targets
    if (levelTargets.length > 0) {
      targetSections.push(
        <div key="levels" className="mb-1">
          <span className="font-medium">Rack Levels: </span>
          <span>
            {levelTargets.map(t => `${t.rack_name} - Level ${t.level_number}`).join(', ')}
          </span>
        </div>
      );
    }
    
    return (
      <div className="text-sm text-muted-foreground">
        {targetSections}
      </div>
    );
  }

  return (
    <Card className='shadow-none'>
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
                    <TableCell className="py-3 px-4 md:px-6">{renderTargets(schedule.targets)}</TableCell>
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
      </CardContent>
    </Card>
  );
} 