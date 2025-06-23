'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusIcon, X } from 'lucide-react'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
      <h3 className="text-sm sm:text-base font-medium">Add Het Traits</h3>
      <div className="flex flex-col lg:flex-row items-start lg:items-center">
          <div className="grid grid-cols-[1fr_auto_1fr] lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5 ">
            <div className='space-y-2'>
              <Label>Possible Trait</Label>
              <Input 
                placeholder="Ex: Eclipse" 
                value={newHetTrait.trait} 
                onChange={(e) => setNewHetTrait({...newHetTrait, trait: e.target.value})}
              />
            </div>
            <div className='space-y-2'>
              <Label>Probability (%)</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={newHetTrait.percentage} 
                onChange={(e) => setNewHetTrait({...newHetTrait, percentage: parseInt(e.target.value) || 0})}
                className='w-[55px] md:w-full'
              />
            </div>
            <div className='space-y-2'>
            <Label>Source</Label>
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
            <div className="flex items-center space-x-2 sm:space-x-3">
                  <Checkbox 
                  id="verified" 
                  checked={newHetTrait.verified} 
                  onCheckedChange={(checked) => 
                      setNewHetTrait({...newHetTrait, verified: checked as boolean})
                  }
                  />
                  <label htmlFor="verified" className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                   Verified
                  </label>
            </div>
          </div>
          <div className="flex justify-end w-full lg:w-auto">
            <Button size="sm" type="button" onClick={addHetTrait}>
              <PlusIcon/>
            </Button>
          </div>
          </div>
      
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trait</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hetTraits.map((trait, index) => (
                <TableRow key={index}>
                  <TableCell>{trait.trait}</TableCell>
                  <TableCell>{trait.percentage}%</TableCell>
                  <TableCell>{trait.source?.replace('_', ' ') || 'Not specified'}</TableCell>
                  <TableCell>{trait.verified ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <button 
                      type="button" 
                      onClick={() => removeHetTrait(trait.trait)} 
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  )
}