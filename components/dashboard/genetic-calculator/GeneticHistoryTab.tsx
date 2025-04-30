'use client'
import { getGeneticCalculations } from '@/app/api/genetic-calculations/history'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMorphsStore } from '@/lib/stores/morphsStore'
import { GeneticCalculation } from '@/lib/types/genetic-calculator'
import { Reptile } from '@/lib/types/reptile'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { DonutChart } from './charts/DonutChart'


const GeneticHistoryTab = () => {
  const { morphs } = useMorphsStore()

  const { data: history, isLoading } = useQuery<GeneticCalculation[]>({
    queryKey: ['genetic-calculations-history'],
    queryFn: getGeneticCalculations,
  })
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!history?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No calculation history found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {history.map((calculation) => {
          const damInfo = reptiles.find((reptile) => reptile.id === calculation.dam_id)
          const sireInfo = reptiles.find((reptile) => reptile.id === calculation.sire_id)
          const damMorph = morphs.find((m) => m.id.toString() === damInfo?.morph_id.toString())
          const sireMorph = morphs.find((m) => m.id.toString() === sireInfo?.morph_id.toString())


          return (
            <Card key={calculation.id} className="p-4">
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Calculation #{calculation.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(calculation.created_at), 'PPp')}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Parents</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Dam</p>
                        <p className="text-sm text-muted-foreground">{damInfo?.name} ({damInfo?.reptile_code})</p>
                        <p className="text-sm text-muted-foreground">{damMorph?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Visual Traits: {damInfo?.visual_traits?.join(', ') || 'None'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Het Traits: {damInfo?.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', ') || 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sire</p>
                        <p className="text-sm text-muted-foreground">{sireInfo?.name} ({sireInfo?.reptile_code})</p>
                        <p className="text-sm text-muted-foreground">{sireMorph?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Visual Traits: {sireInfo?.visual_traits?.join(', ') || 'None'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Het Traits: {sireInfo?.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', ') || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="shadow-none border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Possible Morphs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <DonutChart 
                              data={calculation.result.possible_morphs.map(morph => ({
                                name: morph.name,
                                value: morph.probability
                              }))} 
                            />
                          </CardContent>
                        </Card>

                        <Card className="shadow-none border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Possible Het Traits</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <DonutChart 
                              data={calculation.result.possible_hets.map(het => ({
                                name: het.trait,
                                value: het.probability
                              }))} 
                            />
                          </CardContent>
                        </Card>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Detailed Results</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Possible Morphs</h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Morph</TableHead>
                              <TableHead>Probability</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {calculation.result.possible_morphs.map((morph, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{morph.name}</TableCell>
                                <TableCell>{(morph.probability * 100).toFixed(1)}%</TableCell>
                                <TableCell className="text-muted-foreground">{morph.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Possible Het Traits</h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Trait</TableHead>
                              <TableHead>Probability</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {calculation.result.possible_hets.map((het, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{het.trait}</TableCell>
                                <TableCell>{(het.probability * 100).toFixed(1)}%</TableCell>
                                <TableCell className="text-muted-foreground">{het.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Summary</h5>
                        <p className="text-sm">{calculation.result.probability_summary}</p>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Detailed Analysis</h5>
                        <p className="text-sm whitespace-pre-wrap">{calculation.result.detailed_analysis}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default GeneticHistoryTab
