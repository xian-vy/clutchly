'use client';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { CircleHelp, Dna, Mars, Venus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { CustomNodeData, GroupedReptilesType } from './types';

interface Props {
  reptiles?: Reptile[];
  data: CustomNodeData;
}
const GroupNode = ({ reptiles = [], data }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { morphs } = useMorphsStore();

  // Group offspring by morph
  const groupedByMorph: GroupedReptilesType = useMemo(() => {
    if (!data.groupedReptiles) return {};
    return data.groupedReptiles.reduce((acc, reptile) => {
      const morphName = morphs.find((m: Morph) => m.id.toString() === reptile.morph_id.toString())?.name || 'Unknown';
      if (!acc[morphName]) {
        acc[morphName] = [];
      }
      acc[morphName].push(reptile);
      return acc;
    }, {} as GroupedReptilesType);
  }, [data.groupedReptiles, morphs]);

  return (
    <>
      <div
        className={cn(
          'px-4 py-2 shadow-lg rounded-md border-1 border-dashed border-primary/70 bg-primary/5 min-w-[200px] transition-all duration-300 hover:border-primary cursor-pointer',
          data.isSelected && 'ring-1 ring-primary shadow-2xl z-50',
        )}
        style={{ boxShadow: 'none', outline: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
      >
        <Handle 
          type="target" 
          position={Position.Top} 
          style={{ border: 'none', background: 'transparent' }} 
        />
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="flex items-center gap-2">
            <Dna className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary text-sm sm:text-[0.9rem]">Show {data.count} Offspring</span>
          </div>
          <div className="text-xs sm:text-[0.8rem] text-muted-foreground font-medium">Without descendants</div>
        </div>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{ border: 'none', background: 'transparent' }} 
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl lg:max-w-screen-md 2xl:max-w-screen-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Offspring without Descendants</DialogTitle>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Showing {data.count} offspring grouped by morphs
            </p>
          </DialogHeader>

          {data.parentId && (
            <div className="p-2 rounded-lg ">
              <div className="font-semibold text-sm sm:text-base mb-2">Parents Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.groupedReptiles && data.groupedReptiles.length > 0 && data.groupedReptiles[0].dam_id && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                    <Venus className="h-4 w-4 text-red-500 mt-1" />
                    <div className='space-y-2 flex-1'>
                      <div>
                        <div className="text-lg font-semibold">
                          {reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.name || 'Unknown Dam'}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {morphs.find(m => m.id.toString() === reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.morph_id.toString())?.name || 'Unknown Morph'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.visual_traits?.map((trait, i) => (
                          <Badge key={i} variant="secondary">{trait}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.het_traits?.map((trait, i) => (
                          <Badge key={i} variant="outline">{trait.percentage}% het {trait.trait}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {data.groupedReptiles && data.groupedReptiles.length > 0 && data.groupedReptiles[0].sire_id && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                    <Mars className="h-4 w-4 text-blue-400 mt-1" />
                    <div className='space-y-2 flex-1'>
                      <div>
                        <div className="text-lg font-semibold">
                          {reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.name || 'Unknown Sire'}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {morphs.find(m => m.id.toString() === reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.morph_id.toString())?.name || 'Unknown Morph'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.visual_traits?.map((trait, i) => (
                          <Badge key={i} variant="secondary">{trait}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.het_traits?.map((trait, i) => (
                          <Badge key={i} variant="secondary">{trait.percentage}% het {trait.trait}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 p-1">
              {Object.entries(groupedByMorph).map(([morphName, reptiles]: [string, Reptile[]]) => (
                <div key={morphName} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xs sm:text-sm font-semibold">{morphName}</div>
                    <Badge variant="secondary">{reptiles.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reptiles.map((reptile) => (
                      <div key={reptile.id} className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-xs sm:text-sm ">{reptile.name}</div>
                          {reptile.sex === 'male' ? (
                            <Mars className="h-4 w-4 text-blue-400" />
                          ) : reptile.sex === 'female' ? (
                            <Venus className="h-4 w-4 text-red-500" />
                          ) : (
                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {reptile.visual_traits?.map((trait, i) => (
                            <Badge key={i} variant="secondary">{trait}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {reptile.het_traits?.map((trait, i) => (
                            <Badge key={i} variant="secondary">
                              {trait.percentage}% het {trait.trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupNode; 