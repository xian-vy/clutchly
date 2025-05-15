'use client'
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import FlowChart from './components/FlowChart';
import { useMorphsStore } from '@/lib/stores/morphsStore';

const Lineage = () => {
  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })
 
  const { ReptileSelect } = useGroupedReptileSelect({filteredReptiles: reptiles});
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const {morphs} = useMorphsStore();
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background px-6 py-2' : ''}`}>
        <div className="flex flex-col gap-3 md:flex-row w-full items-start md:items-center justify-between ">
            <div>
                  <h2 className="text-sm lg:text-lg font-semibold tracking-tight text-start">Pedigree Tree</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground text-start">
                    Explore lineage and ancestry through an interactive pedigree tree.
                  </p>
            </div>
            <div className="flex justify-end items-center md:max-w-[250px] w-full gap-3">
                  <ReptileSelect
                        value={selectedReptileId}
                        onValueChange={setSelectedReptileId}
                        placeholder="Select a reptile"
                    />
            </div>
        </div>
        {selectedReptileId !== '' &&   
        <FlowChart 
          isFullscreen={isFullscreen} 
          onExpand={toggleFullscreen}  
          reptileId={selectedReptileId} 
          reptiles={reptiles} 
          morphs={morphs}
        />}
    </div>
  )
}

export default Lineage