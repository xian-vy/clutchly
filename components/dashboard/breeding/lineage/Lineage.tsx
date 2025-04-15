'use client'
import { useGroupedReptiles } from '@/lib/hooks/useGroupedReptiles';
import { useState } from 'react';
import { ReptileTree } from './Tree';

const Lineage = () => {
  const { ReptileSelect } = useGroupedReptiles()
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