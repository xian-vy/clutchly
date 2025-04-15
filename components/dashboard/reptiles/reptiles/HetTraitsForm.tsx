'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useState } from 'react'

interface HetTrait {
  trait: string
  percentage: number
  source?: 'visual_parent' | 'genetic_test' | 'breeding_odds'
  verified?: boolean
}

interface HetTraitsFormProps {
  initialTraits: HetTrait[]
  onChange: (traits: HetTrait[]) => void
}

export function HetTraitsForm({ initialTraits, onChange }: HetTraitsFormProps) {
  const [hetTraits, setHetTraits] = useState<HetTrait[]>(initialTraits || [])
  const [newHetTrait, setNewHetTrait] = useState<HetTrait>({
    trait: '',
    percentage: 50,
    source: 'breeding_odds',
    verified: false
  })

  // Function to add a new het trait
  const addHetTrait = () => {
    if (newHetTrait.trait.trim() !== '' && !hetTraits.some(t => t.trait === newHetTrait.trait)) {
      const updatedTraits = [...hetTraits, { ...newHetTrait }]
      setHetTraits(updatedTraits)
      onChange(updatedTraits)
      setNewHetTrait({
        trait: '',
        percentage: 50,
        source: 'breeding_odds',
        verified: false
      })
    }
  }

  // Function to remove a het trait
  const removeHetTrait = (trait: string) => {
    const updatedTraits = hetTraits.filter(t => t.trait !== trait)
    setHetTraits(updatedTraits)
    onChange(updatedTraits)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Het Traits</h3>
      <Card className='shadow-none'>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
            <div className='space-y-2'>
              <FormLabel>Trait Name</FormLabel>
              <Input 
                placeholder="Trait name" 
                value={newHetTrait.trait} 
                onChange={(e) => setNewHetTrait({...newHetTrait, trait: e.target.value})}
              />
            </div>
            <div className='space-y-2'>
              <FormLabel>Percentage (%)</FormLabel>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={newHetTrait.percentage} 
                onChange={(e) => setNewHetTrait({...newHetTrait, percentage: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className='space-y-2'>
            <FormLabel>Source</FormLabel>
            <Select 
                value={newHetTrait.source} 
                onValueChange={(value: 'visual_parent' | 'genetic_test' | 'breeding_odds') => 
                setNewHetTrait({...newHetTrait, source: value})
                }
            >
                <SelectTrigger>
                <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="visual_parent">Visual Parent</SelectItem>
                <SelectItem value="genetic_test">Genetic Test</SelectItem>
                <SelectItem value="breeding_odds">Breeding Odds</SelectItem>
                </SelectContent>
            </Select>
            </div>
            <div className="flex items-center space-x-2">
                    <Checkbox 
                    id="verified" 
                    checked={newHetTrait.verified} 
                    onCheckedChange={(checked) => 
                        setNewHetTrait({...newHetTrait, verified: checked as boolean})
                    }
                    />
                    <label htmlFor="verified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Verified
                    </label>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="button" onClick={addHetTrait}>
              Add Het Trait
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {hetTraits.length > 0 && (
        <div className="space-y-2 mt-4">
          {hetTraits.map((trait, index) => (
            <Card key={index} className="relative shadow-none">
              <button 
                type="button" 
                onClick={() => removeHetTrait(trait.trait)} 
                className="absolute top-3 right-3 text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </button>
              <CardContent className="pt-4 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Trait</p>
                  <p>{trait.trait}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Percentage</p>
                  <p>{trait.percentage}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p>{trait.source?.replace('_', ' ') || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Verified</p>
                  <p>{trait.verified ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}