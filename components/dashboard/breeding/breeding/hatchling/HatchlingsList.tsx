'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Hatchling } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { HatchlingToReptileForm } from './HatchlingToReptileForm';

interface HatchlingsListProps {
  hatchlings: Hatchling[];
}

export function HatchlingsList({
  hatchlings,
}: HatchlingsListProps) {
  const [selectedHatchling, setSelectedHatchling] = useState<Hatchling | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConvertToReptile = (hatchling: Hatchling) => {
    setSelectedHatchling(hatchling);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
  

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Morph</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hatchlings.map((hatchling) => (
              <TableRow key={hatchling.id}>
                <TableCell>{hatchling.morph}</TableCell>
                <TableCell className="capitalize">{hatchling.sex}</TableCell>
                <TableCell>{hatchling.weight}g</TableCell>
                <TableCell>
                  {format(new Date(hatchling.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConvertToReptile(hatchling)}
                  >
                    Convert to Reptile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {hatchlings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hatchlings found. Add one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Convert Hatchling to Reptile</DialogTitle>
          {selectedHatchling && (
            <HatchlingToReptileForm
              hatchling={selectedHatchling}
              onSuccess={() => {
                setIsDialogOpen(false);
                setSelectedHatchling(null);
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setSelectedHatchling(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 