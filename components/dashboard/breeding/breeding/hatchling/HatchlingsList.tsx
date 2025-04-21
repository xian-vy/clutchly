'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Reptile } from '@/lib/types/reptile';
import { format } from 'date-fns';

interface HatchlingsListProps {
  hatchlings: Reptile[];
}

export function HatchlingsList({
  hatchlings,
}: HatchlingsListProps) {
  const { morphs } = useMorphsStore();

  return (
    <div className="h-[160px] rounded-md border px-2 lg:px-4 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Morph</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Hatched</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {hatchlings.map((hatchling) => {
            const morphName = morphs.find((morph) => morph.id.toString() === hatchling.morph_id)?.name;
            return (
              <TableRow key={hatchling.id}>
                <TableCell>{hatchling.name}</TableCell>
                <TableCell>{morphName}</TableCell>
                <TableCell className="capitalize">{hatchling.sex}</TableCell>
                <TableCell>
                  {hatchling.hatch_date 
                    ? format(new Date(hatchling.hatch_date), 'MMM d, yyyy')
                    : 'Unknown'}
                </TableCell>
              </TableRow>
            );
          })}
          {hatchlings.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                No hatchlings found for this clutch yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}