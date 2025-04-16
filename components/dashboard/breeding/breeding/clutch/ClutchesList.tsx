'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INCUBATION_STATUS_COLORS } from '@/lib/constants/colors';
import { Clutch, IncubationStatus } from '@/lib/types/breeding';
import { Reptile } from '@/lib/types/reptile';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { HatchlingsList } from '../hatchling/HatchlingsList';

interface ClutchesListProps {
  clutch: Clutch;
  hatchlings: Record<string, Reptile[]>;
  onAddHatchling: (clutchId: string) => void;
  onUpdateIncubationStatus: (clutchId: string, status: IncubationStatus) => void;
}

export function ClutchesList({
  clutch,
  hatchlings,
  onAddHatchling,
  onUpdateIncubationStatus,
}: ClutchesListProps) {

  return (
    <div className="space-y-4">
        <div key={clutch.id} className="rounded-lg  bg-card">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Clutch Info
              </CardTitle>
              <Badge
                className={`${
                  INCUBATION_STATUS_COLORS[clutch.incubation_status]
                } capitalize`}
              >
                {clutch.incubation_status.replace('_', ' ')}
              </Badge>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Egg Count</p>
                  <p className="text-sm font-semibold">{clutch.egg_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Fertile Count</p>
                  <p className="text-sm font-semibold">{clutch.fertile_count || 'Not recorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Hatch Date</p>
                  <p className="text-sm font-semibold">{clutch.hatch_date ? format(new Date(clutch.hatch_date), 'MMM d, yyyy') : 'Not hatched'}</p>
                </div>
                <div className="flex gap-2 justify-end">
                {clutch.incubation_status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateIncubationStatus(clutch.id, 'completed');
                    }}
                    className='text-xs'
                  >
                    Mark Completed
                  </Button>
                )}
                {clutch.incubation_status !== 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateIncubationStatus(clutch.id, 'failed');
                    }}
                    className='text-xs'
                  >
                    Mark Failed
                  </Button>
                )}
              </div>
              </div>
             
            </CardContent>
          </Card>

          <div className="px-6 pb-6 pt-2 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Hatchlings</h3>
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddHatchling(clutch.id);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Hatchling
              </Button>
            </div>
            
            <HatchlingsList hatchlings={hatchlings[clutch.id] || []} />
          </div>
        </div>
      
     
    </div>
  );
}