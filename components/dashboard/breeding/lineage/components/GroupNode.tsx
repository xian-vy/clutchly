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
import { STATUS_COLORS } from '@/lib/constants/colors';

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
          'px-4 py-2.5 dark:shadow-md rounded-md border-2 border-dashed border-gray-400 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/30 w-[250px]  transition-all duration-300 hover:border-primary cursor-pointer -mt-[10px]',
          data.isSelected && 'ring-2 ring-primary shadow-lg z-50',
        )}
        onClick={(e) => {
          e.stopPropagation();
          setDrawerOpen(true);
        }}
      >
        <div className="relative">
          <Handle 
            type="target" 
            position={Position.Top} 
            style={{ 
              border: 'none', 
              background: 'transparent',
              width: '20px',
              height: '20px',
              top: '-15px',
              left: '50%',
              transform: 'translateX(-50%)'
            }} 
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 min-h-[200px]">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-foreground" />
            <span className="font-bold text-foreground text-sm lg:text-base">
              {data.count} Offspring
            </span>
          </div>
          <div className="text-xs sm:text-sm lg:text-base  text-foreground font-medium">Without descendants</div>
          <div className="flex items-center text-sm lg:text-base text-muted-foreground gap-1 mt-1">
            <span>View details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <div className="relative">
          <Handle 
            type="source" 
            position={Position.Bottom} 
            style={{ 
              border: 'none', 
              background: 'transparent',
              width: '20px',
              height: '20px',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)'
            }} 
          />
        </div>
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
                        <div className="text-xs font-medium text-primary">
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
                          <Badge key={i} variant="secondary">{trait.percentage}% het {trait.trait}</Badge>
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
                        <div className="text-xs font-medium text-primary">
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
                    <ScrollArea className="h-[calc(100vh-450px)]">
                      <div className="space-y-3 px-2 pb-6">
                        {morphReptiles.map((reptile) => (
                          <div 
                            key={reptile.id} 
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border bg-card/30 hover:bg-card/70 transition-colors",
                            )}
                          >
                            {reptile.sex === 'male' ? (
                              <Mars className="h-3.5 w-3.5 text-blue-400 mt-0.5" />
                            ) : reptile.sex === 'female' ? (
                              <Venus className="h-3.5 w-3.5 text-red-500 mt-0.5" />
                            ) : (
                              <CircleHelp className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                            )}
                            
                            <div className="space-y-1.5 2xl:space-y-2 3xl:space-y-2.5 flex-1">
                              <div className="flex justify-between items-start gap-1">
                                  <div className="font-semibold text-xs sm:text-sm">{reptile.name}</div>
                                  <Badge variant="default" className={`${STATUS_COLORS[reptile.status.toLowerCase() as keyof typeof STATUS_COLORS]} capitalize`}>
                                    {reptile.status}
                                  </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {reptile.visual_traits?.map((trait, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
                                ))}
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {reptile.het_traits?.map((trait, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {trait.percentage}% het {trait.trait}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex justify-end text-[0.65rem] sm:text-xs">DOH {" : "}{reptile.hatch_date}</div>

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