'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
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
      <h3 className="text-lg font-medium">Het Traits</h3>
      <Card className='shadow-none'>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
            <div className='space-y-2'>
              <FormLabel>Het Trait Name</FormLabel>
              <Input 
                placeholder="Ex: Eclipse" 
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
              Add Het 
            </Button>
          </div>
        </CardContent>
      </Card>
      
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