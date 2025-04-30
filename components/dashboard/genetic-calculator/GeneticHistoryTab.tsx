'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GeneticCalculation } from '@/lib/types/genetic-calculator'
import { format } from 'date-fns'
import { getGeneticCalculations } from '@/app/api/genetic-calculations/history'
import { Reptile } from '@/lib/types/reptile'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { useMorphsStore } from '@/lib/stores/morphsStore'
import { ChevronDown, Dna } from 'lucide-react'
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
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip
} from 'recharts'

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-8)'
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-foreground">{label}</p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <span>Probability: {(payload[0].value * 100).toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  return null
}

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Genetic Calculation History
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {history.map((calculation) => {
          const damInfo = reptiles.find((reptile) => reptile.id === calculation.dam_id)
          const sireInfo = reptiles.find((reptile) => reptile.id === calculation.sire_id)
          const damMorph = morphs.find((m) => m.id.toString() === damInfo?.morph_id.toString())
          const sireMorph = morphs.find((m) => m.id.toString() === sireInfo?.morph_id.toString())

          // Format data for pie charts
          const morphData = calculation.result.possible_morphs.map(morph => ({
            name: morph.name,
            value: morph.probability
          }))

          const hetData = calculation.result.possible_hets.map(het => ({
            name: het.trait,
            value: het.probability
          }))

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
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={morphData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={2}
                                label={({ name, percent }) => 
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {morphData.map((_, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend 
                                formatter={(value) => value}
                                wrapperStyle={{ 
                                  fontSize: '13px',
                                  color: 'var(--color-foreground)',
                                  paddingTop: '20px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Possible Het Traits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={hetData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={2}
                                label={({ name, percent }) => 
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {hetData.map((_, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend 
                                formatter={(value) => value}
                                wrapperStyle={{ 
                                  fontSize: '13px',
                                  color: 'var(--color-foreground)',
                                  paddingTop: '20px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
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
