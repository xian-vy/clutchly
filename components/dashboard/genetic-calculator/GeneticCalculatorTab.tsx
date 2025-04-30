'use client'
import React, { useState } from 'react'
import { useSelectList } from '@/lib/hooks/useSelectList'
import { useResource } from '@/lib/hooks/useResource'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Reptile } from '@/lib/types/reptile'
import { GeneticCalculatorResponse } from '@/lib/types/genetic-calculator'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Info, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const GeneticCalculatorTab = () => {
  const [dam, setDam] = useState<Reptile | null>(null)
  const [sire, setSire] = useState<Reptile | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculation, setCalculation] = useState<GeneticCalculatorResponse | null>(null)

  const { 
    resources: reptiles, 
  } = useResource({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  const { Select: DamSelect } = useSelectList({
    data: reptiles || [],
    getValue: (reptile) => reptile.id,
    getLabel: (reptile) => `${reptile.name} (${reptile.reptile_code})`,
  })

  const { Select: SireSelect } = useSelectList({
    data: reptiles || [],
    getValue: (reptile) => reptile.id,
    getLabel: (reptile) => `${reptile.name} (${reptile.reptile_code})`,
  })

  const handleCalculate = async () => {
    if (!dam || !sire) {
      toast.error('Please select both dam and sire');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { dam, sire }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate genetics');
      }

      const data: GeneticCalculatorResponse = await response.json();
      setCalculation(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to calculate genetics');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDamChange = (value: string) => {
    const selectedDam = reptiles?.find(r => r.id === value) || null;
    setDam(selectedDam);
    setCalculation(null); // Reset calculation when parents change
  };

  const handleSireChange = (value: string) => {
    const selectedSire = reptiles?.find(r => r.id === value) || null;
    setSire(selectedSire);
    setCalculation(null); // Reset calculation when parents change
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How to use the Genetic Calculator</AlertTitle>
        <AlertDescription>
          Select a dam (female) and sire (male) from your reptiles to calculate possible offspring genetics. 
          The calculator will analyze both visual traits and het traits to predict possible outcomes.
        </AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI-Powered Analysis</AlertTitle>
        <AlertDescription>
          This calculator uses AI to predict genetic outcomes. While it provides valuable insights, 
          please note that genetic inheritance can be complex and results should be used as a guide only.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Dam (F)</h3>
              <DamSelect
                value={dam?.id || ''}
                onValueChange={handleDamChange}
                placeholder="Select dam..."
              />
              {dam && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Morph: {dam.morph_id}</p>
                  <p>Visual Traits: {dam.visual_traits?.join(', ') || 'None'}</p>
                  <p>Het Traits: {dam.het_traits?.map(het => `${het.trait} (${het.percentage}%)`).join(', ') || 'None'}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Sire (M)</h3>
              <SireSelect
                value={sire?.id || ''}
                onValueChange={handleSireChange}
                placeholder="Select sire..."
              />
              {sire && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Morph: {sire.morph_id}</p>
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
          <h3 className="text-lg font-semibold mb-4">Genetic Analysis Results</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Possible Morphs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculation.result.possible_morphs.map((morph, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{morph.name}</h5>
                        <p className="text-sm text-muted-foreground">{morph.description}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {(morph.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Possible Het Traits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculation.result.possible_hets.map((het, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{het.trait}</h5>
                        <p className="text-sm text-muted-foreground">{het.description}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {(het.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Summary</h4>
              <p className="text-sm">{calculation.result.probability_summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Detailed Analysis</h4>
              <p className="text-sm whitespace-pre-wrap">{calculation.result.detailed_analysis}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default GeneticCalculatorTab
