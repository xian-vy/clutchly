'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clutch, IncubationStatus } from '@/lib/types/breeding';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { HatchlingsList } from '../hatchling/HatchlingsList';
import { Reptile } from '@/lib/types/reptile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ClutchesListProps {
  clutches: Clutch[];
  hatchlings: Record<string, Reptile[]>;
  incubationStatusColors: Record<string, string>;
  onAddHatchling: (clutchId: string) => void;
  onUpdateIncubationStatus: (clutchId: string, status: IncubationStatus) => void;
}

export function ClutchesList({
  clutches,
  hatchlings,
  incubationStatusColors,
  onAddHatchling,
  onUpdateIncubationStatus,
}: ClutchesListProps) {
  const [openClutches, setOpenClutches] = useState<Record<string, boolean>>({});

  const toggleClutch = (clutchId: string) => {
    setOpenClutches(prev => ({
      ...prev,
      [clutchId]: !prev[clutchId]
    }));
  };

  return (
    <div className="space-y-4">
      {clutches.map((clutch) => (
        <Collapsible 
          key={clutch.id} 
          open={openClutches[clutch.id]} 
          onOpenChange={() => toggleClutch(clutch.id)}
          className="border rounded-lg overflow-hidden"
        >
          <Card className="border-0 shadow-none">
            <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center">
                  Clutch: {format(new Date(clutch.lay_date), 'MMM d, yyyy')}
                  <span className="ml-2">
                    {openClutches[clutch.id] ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </span>
                </CardTitle>
                <Badge
                  className={`${
                    incubationStatusColors[clutch.incubation_status]
                  } text-white capitalize`}
                >
                  {clutch.incubation_status.replace('_', ' ')}
                </Badge>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Egg Count</p>
                  <p>{clutch.egg_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fertile Count</p>
                  <p>{clutch.fertile_count || 'Not recorded'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hatch Date</p>
                  <p>{clutch.hatch_date ? format(new Date(clutch.hatch_date), 'MMM d, yyyy') : 'Not hatched'}</p>
                </div>
                <div className="flex gap-2 items-end">
                  {clutch.incubation_status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateIncubationStatus(clutch.id, 'completed');
                      }}
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
                    >
                      Mark Failed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <CollapsibleContent>
            <div className="px-6 pb-6 pt-2 border-t">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Hatchlings</h3>
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
          </CollapsibleContent>
        </Collapsible>
      ))}
      
      {clutches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No clutches found. Add one to get started!
        </div>
      )}
    </div>
  );
}