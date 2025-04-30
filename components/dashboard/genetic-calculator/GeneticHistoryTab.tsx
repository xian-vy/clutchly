'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { GeneticCalculation } from '@/lib/types/genetic-calculator'
import { format } from 'date-fns'
import { getGeneticCalculations } from '@/app/api/genetic-calculations/history'
import { Reptile } from '@/lib/types/reptile'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { useMorphsStore } from '@/lib/stores/morphsStore'

const GeneticHistoryTab = () => {
    const {morphs} = useMorphsStore()

  const { data: history, isLoading } = useQuery<GeneticCalculation[]>({
    queryKey: ['genetic-calculations-history'],
    queryFn: getGeneticCalculations,
  });
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!history?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No calculation history found.
      </div>
    );
  }
  

  return (
    <div className="space-y-4">
      {history.map((calculation) => {
        const damInfo = reptiles.find((reptile) => reptile.id === calculation.dam_id);
        const sireInfo = reptiles.find((reptile) => reptile.id === calculation.sire_id);
        const damMorph =morphs.find((m) => m.id.toString() === damInfo?.morph_id.toString());
        const sireMorph =  morphs.find((m) => m.id.toString() === sireInfo?.morph_id.toString());
        return(
        <Card key={calculation.id} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">Calculation #{calculation.id}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(calculation.created_at), 'PPp')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Parents</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Dam</p>
                  <p className="text-sm text-muted-foreground">{damInfo?.name + " " + damInfo?.reptile_code}</p>
                  <p className="text-sm text-muted-foreground">{damMorph?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Sire</p>
                  <p className="text-sm text-muted-foreground">{sireInfo?.name + " " + sireInfo?.reptile_code}</p>
                    <p className="text-sm text-muted-foreground">{sireMorph?.name}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Results</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Possible Morphs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {calculation.result.possible_morphs.map((morph, index) => (
                      <div key={index} className="text-sm">
                        {morph.name} ({(morph.probability * 100).toFixed(1)}%)
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Possible Het Traits</p>
                  <div className="grid grid-cols-2 gap-2">
                    {calculation.result.possible_hets.map((het, index) => (
                      <div key={index} className="text-sm">
                        {het.trait} ({(het.probability * 100).toFixed(1)}%)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )})}
    </div>
  )
}

export default GeneticHistoryTab
