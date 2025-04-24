'use client'
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useState } from 'react';
import { ReptileTree } from './Tree';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';

const Lineage = () => {
  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })
 
  const { ReptileSelect } = useGroupedReptileSelect({filteredReptiles: reptiles});
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');


  return (
    <div>
      <div className="flex items-center float-right max-w-[270px] w-full">
          <ReptileSelect
                value={selectedReptileId}
                onValueChange={setSelectedReptileId}
                placeholder="Select a reptile"
            />
      </div>
      {selectedReptileId !== '' &&  <ReptileTree reptileId={selectedReptileId} /> }
    </div>
  )
}

export default Lineage