'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

interface VisualTraitsFormProps {
  initialTraits: string[]
  onChange: (traits: string[]) => void
}

export function VisualTraitsForm({ initialTraits, onChange }: VisualTraitsFormProps) {
  const [visualTraits, setVisualTraits] = useState<string[]>(initialTraits || [])
  const [newVisualTrait, setNewVisualTrait] = useState<string>('')

  // Function to add a new visual trait
  const addVisualTrait = () => {
    if (newVisualTrait.trim() !== '' && !visualTraits.includes(newVisualTrait)) {
      const updatedTraits = [...visualTraits, newVisualTrait]
      setVisualTraits(updatedTraits)
      onChange(updatedTraits)
      setNewVisualTrait('')
    }
  }

  // Function to remove a visual trait
  const removeVisualTrait = (trait: string) => {
    const updatedTraits = visualTraits.filter(t => t !== trait)
    setVisualTraits(updatedTraits)
    onChange(updatedTraits)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm sm:text-base font-medium">Add Visual Traits</h3>
      <div className="flex gap-2">
        <Input 
          placeholder="Add visual trait" 
          value={newVisualTrait} 
          onChange={(e) => setNewVisualTrait(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addVisualTrait()
            }
          }}
        />
        <Button type="button" onClick={addVisualTrait} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {visualTraits.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {visualTraits.map((trait, index) => (
            <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md  text-xs xl:text-sm">
              <span>{trait}</span>
              <button 
                type="button" 
                onClick={() => removeVisualTrait(trait)} 
                className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}