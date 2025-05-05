'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph } from '@/lib/types/morph';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import { CircleHelp, Dna, Mars, Venus, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { CustomNodeData, GroupedReptilesType } from './types';

interface Props {
  reptiles?: Reptile[];
  data: CustomNodeData;
}

const GroupNode = ({ reptiles = [], data }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { morphs } = useMorphsStore();
  const [selectedMorph, setSelectedMorph] = useState<string>('');

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

  // Set initial selected morph when morphs are loaded
  useMemo(() => {
    if (Object.keys(groupedByMorph).length > 0 && !selectedMorph) {
      setSelectedMorph(Object.keys(groupedByMorph)[0]);
    }
  }, [groupedByMorph, selectedMorph]);

  return (
    <>
      <div
        className={cn(
          'px-4 py-2 shadow-md rounded-md border border-primary/50 bg-primary/5 min-w-[200px] transition-all duration-300 hover:border-primary cursor-pointer',
          data.isSelected && 'ring-2 ring-primary shadow-lg z-50',
        )}
        onClick={(e) => {
          e.stopPropagation();
          setDrawerOpen(true);
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
            <span className="font-medium text-primary text-sm sm:text-[0.9rem]">
              {data.count} Offspring
            </span>
          </div>
          <div className="text-xs sm:text-[0.8rem] text-muted-foreground font-medium">Without descendants</div>
          <div className="flex items-center text-xs text-primary/70 gap-1 mt-1">
            <span>View details</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{ border: 'none', background: 'transparent' }} 
        />
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold mb-1">Offspring without Descendants</DrawerTitle>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Showing {data.count} offspring grouped by morphs
            </p>
          </DrawerHeader>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-2 rounded-lg bg-card/50">
              <div className="font-semibold text-sm sm:text-base mb-2">Parents</div>
              <div className="grid grid-cols-2 gap-4">
                {data.groupedReptiles && data.groupedReptiles.length > 0 && data.groupedReptiles[0].dam_id && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                    <Venus className="h-4 w-4 text-red-500 mt-1" />
                    <div className='space-y-2 flex-1'>
                      <div>
                        <div className="text-base font-semibold">
                          {data.parentNames?.[0] || reptiles?.find(r => r.id === data.groupedReptiles?.[0].dam_id)?.name || 'Unknown Dam'}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
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
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                    <Mars className="h-4 w-4 text-blue-400 mt-1" />
                    <div className='space-y-2 flex-1'>
                      <div>
                        <div className="text-base font-semibold">
                          {data.parentNames?.[1] || reptiles?.find(r => r.id === data.groupedReptiles?.[0].sire_id)?.name || 'Unknown Sire'}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
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
                          <Badge key={i} variant="outline">{trait.percentage}% het {trait.trait}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex-1 overflow-hidden pb-6">
              <div className="font-semibold text-sm sm:text-base mb-3 px-2">Offspring by Morph</div>
              
              <div className="w-full mb-4 flex flex-wrap gap-2 px-2">
                {Object.entries(groupedByMorph).map(([morphName, reptiles]: [string, Reptile[]]) => (
                  <Badge 
                    key={morphName} 
                    variant={selectedMorph === morphName ? "default" : "outline"} 
                    className={cn(
                      "cursor-pointer py-1 px-3 text-xs hover:bg-accent/80 transition-colors",
                      selectedMorph === morphName ? "bg-primary text-primary-foreground" : ""
                    )}
                    onClick={() => setSelectedMorph(morphName)}
                  >
                    {morphName} ({reptiles.length})
                  </Badge>
                ))}
              </div>
                
              <div className="mt-2">
                {Object.entries(groupedByMorph).map(([morphName, morphReptiles]: [string, Reptile[]]) => (
                  <div 
                    key={morphName} 
                    className={cn(
                      "hidden",
                      selectedMorph === morphName && "block"
                    )}
                  >
                    <ScrollArea className="h-[calc(100vh-320px)]">
                      <div className="space-y-3 px-2 pb-6">
                        {morphReptiles.map((reptile) => (
                          <div 
                            key={reptile.id} 
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border bg-card/30 hover:bg-card/70 transition-colors",
                            )}
                          >
                            {reptile.sex === 'male' ? (
                              <Mars className="h-4 w-4 text-blue-400 mt-1" />
                            ) : reptile.sex === 'female' ? (
                              <Venus className="h-4 w-4 text-red-500 mt-1" />
                            ) : (
                              <CircleHelp className="h-4 w-4 text-muted-foreground mt-1" />
                            )}
                            
                            <div className="space-y-1.5 flex-1">
                              <div className="font-semibold text-xs sm:text-sm">{reptile.name}</div>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {reptile.visual_traits?.map((trait, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
                                ))}
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {reptile.het_traits?.map((trait, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {trait.percentage}% het {trait.trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GroupNode; 