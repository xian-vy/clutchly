'use client'
import React, { useState } from 'react'
import { useSelectList } from '@/lib/hooks/useSelectList'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Reptile } from '@/lib/types/reptile'
import { GeneticCalculatorResponse } from '@/lib/types/genetic-calculator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertTriangle, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMorphsStore } from '@/lib/stores/morphsStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useReptilesParentsBySpecies } from '@/lib/hooks/useReptilesParentsBySpecies'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutChart } from './charts/DonutChart'
import { Species } from '@/lib/types/species'
import { Organization } from '@/lib/types/organizations'
import { getOrganization } from '@/app/api/organizations/organizations'
import { useSortedSpecies } from '@/lib/hooks/useSortedSpecies'

const GeneticCalculatorTab = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>( null)
  const [dam, setDam] = useState<Reptile | null>(null)
  const [sire, setSire] = useState<Reptile | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculation, setCalculation] = useState<GeneticCalculatorResponse | null>(null)
  const {morphs} = useMorphsStore()
  const { species,  } = useSpeciesStore()
  const queryClient = useQueryClient();

  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });
  const { data: organization } = useQuery<Organization>({
    queryKey: ['organization2'],
    queryFn: getOrganization
  })
  const { selectedSpeciesId, maleReptiles, femaleReptiles } = useReptilesParentsBySpecies({
    reptiles,
    speciesId : selectedSpecies?.id.toString() || '',
  });
  const sortedSpecies = useSortedSpecies(species, organization?.selected_species || []);

  const { Select: SpeciesSelect } = useSelectList({
    data: sortedSpecies,
    getValue: (species) => species.id.toString(),
    getLabel: (species) => species.name,
  })

  const { Select: DamSelect } = useSelectList({
    data: femaleReptiles,
    getValue: (reptile) => reptile.id,
    getLabel: (reptile) => `${reptile.name} (${reptile.reptile_code})`,
    disabled : !selectedSpeciesId,
  })

  const { Select: SireSelect } = useSelectList({
    data: maleReptiles,
    getValue: (reptile) => reptile.id,
    getLabel: (reptile) => `${reptile.name} (${reptile.reptile_code})`,
    disabled : !selectedSpeciesId,
  })

  const handleCalculate = async () => {
    if (!dam || !sire) {
      toast.error('Please select both dam and sire');
      return;
    }

    setIsCalculating(true);
    try {
      const damDetails = {
         id: dam.id,
         morph : morphs.find((morph) => morph.id.toString() === dam.morph_id.toString())?.name,
         visual_traits : dam.visual_traits?.join(', '),
         het_traits : dam.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', '),
      }
      const sireDetails = {
        id: sire.id,
         morph : morphs.find((morph) => morph.id.toString() === sire.morph_id.toString())?.name,
         visual_traits : sire.visual_traits?.join(', '),
         het_traits : sire.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', '),
      }
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { dam:damDetails,sire:sireDetails, selectedSpecies }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate genetics');
      }

      const data: GeneticCalculatorResponse = await response.json();
      setCalculation(data);
      queryClient.invalidateQueries({ queryKey: ['genetic-calculations-history'] });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to calculate genetics');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSpeciesChange = (value: string) => {
    setSelectedSpecies(species.find(s => s.id.toString() === value) || null)
    setDam(null)
    setSire(null)
    setCalculation(null)
  }

  const handleDamChange = (value: string) => {
    const selectedDam = femaleReptiles?.find(r => r.id === value) || null;
    setDam(selectedDam);
    setCalculation(null); // Reset calculation when parents change
  };

  const handleSireChange = (value: string) => {
    const selectedSire = maleReptiles?.find(r => r.id === value) || null;
    setSire(selectedSire);
    setCalculation(null); // Reset calculation when parents change
  };

  return (
    <div className="space-y-6">
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI-Powered Analysis</AlertTitle>
        <AlertDescription>
          This calculator uses AI to predict genetic outcomes. While it provides valuable insights, 
          please note that genetic inheritance can be complex and results should be used as a guide only.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <div className='md:h-[120px]'>
                <h3 className="text-sm font-medium mb-2">Species</h3>
                <SpeciesSelect
                  value={selectedSpeciesId}
                  onValueChange={handleSpeciesChange}
                  placeholder="Select species..."
                />
            </div>
            <div className='md:h-[120px]'>
              <h3 className="text-sm font-medium mb-2">Dam (F)</h3>
              <DamSelect
                value={dam?.id || ''}
                onValueChange={handleDamChange}
                placeholder="Select dam..."
              />
              {dam && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Morph: {morphs.find((morph) => morph.id.toString() === dam.morph_id.toString())?.name}</p>
                  <p>Visual Traits: {dam.visual_traits?.join(', ') || 'None'}</p>
                  <p>Het Traits: {dam.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', ') || 'None'}</p>
                </div>
              )}
            </div>
            <div className='md:h-[120px]'>
              <h3 className="text-sm font-medium mb-2">Sire (M)</h3>
              <SireSelect
                value={sire?.id || ''}
                onValueChange={handleSireChange}
                placeholder="Select sire..."
              />
              {sire && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Morph: {morphs.find((morph) => morph.id.toString() === sire.morph_id.toString())?.name}</p>
                  <p>Visual Traits: {sire.visual_traits?.join(', ') || 'None'}</p>
                  <p>Het Traits: {sire.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', ') || 'None'}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-center">
            <Button 
              onClick={handleCalculate}
              disabled={!dam || !sire || isCalculating}
              size="lg"
              className="min-w-[200px]"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Offspring Genetics'
              )}
            </Button>
          </div>
      </Card>

      {calculation?.error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{calculation.error}</AlertDescription>
        </Alert>
      )}

      {calculation?.result && (
        <Card className="p-6">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold ">Genetic Analysis Results</h3>
          
          <div className="space-y-6">
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
            <div  className="max-w-[300px] sm:max-w-[640px] md:max-w-[700px] lg:[900px] xl:max-w-[1100px] lg:w-full overflow-x-auto">
              <h4 className="text-sm font-medium mb-2">Possible Morphs</h4>
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

            <div  className="max-w-[300px] sm:max-w-[640px] md:max-w-[700px] lg:[900px] xl:max-w-[1100px] lg:w-full overflow-x-auto">
              <h4 className="text-sm font-medium mb-2">Possible Het Traits</h4>
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

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                <ChevronDown className="h-4 w-4" />
                Summary & Detailed Analysis
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Summary</h4>
                  <p className="text-xs sm:text-sm">{calculation.result.probability_summary}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Detailed Analysis</h4>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{calculation.result.detailed_analysis}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Card>
      )}
    </div>
  )
}

export default GeneticCalculatorTab
