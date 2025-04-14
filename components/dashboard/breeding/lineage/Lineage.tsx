'use client'
import React, { useState } from 'react'
import { ReptileTree } from './Tree'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';

const Lineage = () => {
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });


  return (
    <div>
     <div className="flex items-center space-x-4">
        <Select
          value={selectedReptileId}
          onValueChange={setSelectedReptileId}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a reptile" />
          </SelectTrigger>
          <SelectContent>
            {reptiles.map((reptile) => (
              <SelectItem key={reptile.id} value={reptile.id}>
                {reptile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedReptileId !== '' &&  <ReptileTree reptileId={selectedReptileId} /> }
    </div>
  )
}

export default Lineage