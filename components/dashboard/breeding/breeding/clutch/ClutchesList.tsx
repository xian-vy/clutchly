'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INCUBATION_STATUS_COLORS } from '@/lib/constants/colors';
import { BreedingProject, Clutch, IncubationStatus, NewClutch } from '@/lib/types/breeding';
import { Reptile } from '@/lib/types/reptile';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { HatchlingsList } from '../hatchling/HatchlingsList';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ClutchForm } from './ClutchForm';
import { createClutch, updateClutch } from '@/app/api/breeding/clutches';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
interface ClutchesListProps {
  clutch: Clutch;
  hatchlings: Record<string, Reptile[]>;
  onAddHatchling: (clutchId: string) => void;
  onUpdateIncubationStatus: (clutchId: string, status: IncubationStatus) => void;
  project : BreedingProject
}

export function ClutchesList({
  clutch,
  hatchlings,
  onAddHatchling,
  onUpdateIncubationStatus,
  project
}: ClutchesListProps) {
  const [clutchDialogOpen, setClutchDialogOpen] = useState(false);
  const [editingClutch, setEditingClutch] = useState<Clutch | null>(null);
  const queryClient = useQueryClient();

  const handleClutchSubmit = async (data: NewClutch) => {
    try {
      if (editingClutch) {
        await updateClutch(editingClutch.id, {
          ...data,
          breeding_project_id: project.id,
        });
        toast.success('Clutch updated successfully');
      } else {
        await createClutch({
          ...data,
          breeding_project_id: project.id,
        });
        toast.success('Clutch added successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: ['clutches', project.id] });
      queryClient.invalidateQueries({ queryKey: ['all-hatchlings', project.id] });
      setClutchDialogOpen(false);
      setEditingClutch(null);
    } catch (error) {
      console.error('Error saving clutch:', error);
      toast.error(`Failed to ${editingClutch ? 'update' : 'add'} clutch`);
    }
  };

  return (
    <div className="space-y-4">
        <div key={clutch.id} className="rounded-lg  bg-card">
          <Card className="border-0 shadow-none pt-2 pb-3 gap-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Clutch Info
              </CardTitle>
          
              <div className="flex justify-end items-center">
              <Button size="sm" onClick={() => {
                  setEditingClutch(null);
                  setClutchDialogOpen(true);
                }} className='w-[100px]'>
                  <Plus /> Add Clutch
                </Button>
            </div>
            </CardHeader>
            
            <CardContent>
              <div className="relative w-full overflow-auto border rounded-md  px-2 lg:px-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead >Egg Count</TableHead>
                      <TableHead>Fertile Count</TableHead>
                      <TableHead>Hatch Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow >
                      <TableCell className="text-start">{clutch.egg_count}</TableCell>
                      <TableCell className="text-start">{clutch.fertile_count || 'Not recorded'}</TableCell>
                      <TableCell className="text-start">
                        {clutch.hatch_date ? format(new Date(clutch.hatch_date), 'MMM d, yyyy') : 'Not hatched'}
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge className={`${INCUBATION_STATUS_COLORS[clutch.incubation_status]} capitalize`}>
                          {clutch.incubation_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-start ">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {clutch.incubation_status !== 'completed' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateIncubationStatus(clutch.id, 'completed');
                                }}
                              >
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            {clutch.incubation_status !== 'failed' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateIncubationStatus(clutch.id, 'failed');
                                }}
                              >
                                Mark Failed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClutch(clutch);
                                setClutchDialogOpen(true);
                              }}
                            >
                              Edit Clutch Info
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody >
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="px-6 xl:py-2 ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Hatchlings</h3>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddHatchling(clutch.id);
                }}
                className='w-[100px]'
              >
                <Plus className="w-4 h-4" />  Hatchling
              </Button>
            </div>
            
            <HatchlingsList hatchlings={hatchlings[clutch.id] || []} />
          </div>
        </div>
      
       
      <Dialog open={clutchDialogOpen} onOpenChange={(open) => {
        setClutchDialogOpen(open);
        if (!open) setEditingClutch(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>{editingClutch ? 'Edit' : 'Add'} Clutch</DialogTitle>
          <ClutchForm
            breedingProjectId={project.id}
            onSubmit={handleClutchSubmit}
            onCancel={() => {
              setClutchDialogOpen(false);
              setEditingClutch(null);
            }}
            speciesID={project.species_id}
            initialData={editingClutch ? {
              ...editingClutch,
              lay_date: editingClutch.lay_date.split('T')[0],
              hatch_date: editingClutch.hatch_date ? editingClutch.hatch_date.split('T')[0] : undefined,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}