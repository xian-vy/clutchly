'use client'
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import FlowChart from './components/FlowChart';

const Lineage = () => {
  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })
 
  const { ReptileSelect } = useGroupedReptileSelect({filteredReptiles: reptiles});
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');


  return (
    <div>
      <div className="flex w-full items-center justify-between">
          <div>
                <h2 className="text-sm lg:text-lg font-semibold tracking-tight text-start">Pedigree Tree</h2>
                <p className="text-sm text-muted-foreground">
                   Explore lineage and ancestry through an interactive pedigree tree.
                </p>
          </div>
          <div className="flex items-center float-right max-w-[270px] w-full">
                <ReptileSelect
                      value={selectedReptileId}
                      onValueChange={setSelectedReptileId}
                      placeholder="Select a reptile"
                  />
          </div>
      </div>
      {selectedReptileId !== '' &&   <FlowChart reptileId={selectedReptileId} reptiles={reptiles} />}

    </div>
  )
}

export default Lineage