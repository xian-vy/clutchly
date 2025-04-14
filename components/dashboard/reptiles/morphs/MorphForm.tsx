'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { Morph, NewMorph } from '@/lib/types/morph'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species_id: z.string().min(1, 'Species is required'),
  genetic_traits: z.array(z.string()),
  visual_traits: z.array(z.string())
})

interface MorphFormProps {
  initialData?: Morph & { species: { name: string } }
  onSubmit: (data: NewMorph) => Promise<void>
  onCancel: () => void
}

type FormValues = {
  name: string
  species_id: string
  genetic_traits: string[]
  visual_traits: string[]
}

export function MorphForm({ initialData, onSubmit, onCancel }: MorphFormProps) {
  const [geneticTraits, setGeneticTraits] = useState<string[]>(initialData?.genetic_traits || [])
  const [visualTraits, setVisualTraits] = useState<string[]>(initialData?.visual_traits || [])
  const [newGeneticTrait, setNewGeneticTrait] = useState('')
  const [newVisualTrait, setNewVisualTrait] = useState('')
  
  // Get species from the Zustand store
  const { species, fetchSpecies } = useSpeciesStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      species_id: initialData?.species_id?.toString() || '',
      genetic_traits: initialData?.genetic_traits || [],
      visual_traits: initialData?.visual_traits || []
    }
  })

  useEffect(() => {
    // Fetch species if not already loaded
    if (species.length === 0) {
      fetchSpecies()
    }
  }, [species.length, fetchSpecies])

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({
      ...data,
      species_id: parseInt(data.species_id, 10)
    })
  }

  const handleAddGeneticTrait = () => {
    if (newGeneticTrait.trim()) {
      const updatedTraits = [...geneticTraits, newGeneticTrait.trim()]
      setGeneticTraits(updatedTraits)
      form.setValue('genetic_traits', updatedTraits)
      setNewGeneticTrait('')
    }
  }

  const handleRemoveGeneticTrait = (index: number) => {
    const updatedTraits = geneticTraits.filter((_, i) => i !== index)
    setGeneticTraits(updatedTraits)
    form.setValue('genetic_traits', updatedTraits)
  }

  const handleAddVisualTrait = () => {
    if (newVisualTrait.trim()) {
      const updatedTraits = [...visualTraits, newVisualTrait.trim()]
      setVisualTraits(updatedTraits)
      form.setValue('visual_traits', updatedTraits)
      setNewVisualTrait('')
    }
  }

  const handleRemoveVisualTrait = (index: number) => {
    const updatedTraits = visualTraits.filter((_, i) => i !== index)
    setVisualTraits(updatedTraits)
    form.setValue('visual_traits', updatedTraits)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {species.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormItem>
            <FormLabel>Genetic Traits</FormLabel>
            <div className="flex gap-2">
              <Input
                value={newGeneticTrait}
                onChange={(e) => setNewGeneticTrait(e.target.value)}
                placeholder="Add genetic trait"
              />
              <Button type="button" onClick={handleAddGeneticTrait}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {geneticTraits.map((trait, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {trait}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveGeneticTrait(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </FormItem>

          <FormItem>
            <FormLabel>Visual Traits</FormLabel>
            <div className="flex gap-2">
              <Input
                value={newVisualTrait}
                onChange={(e) => setNewVisualTrait(e.target.value)}
                placeholder="Add visual trait"
              />
              <Button type="button" onClick={handleAddVisualTrait}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {visualTraits.map((trait, index) => (
                <Badge
                  key={index}
                  className="flex items-center gap-1"
                >
                  {trait}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveVisualTrait(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </FormItem>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Morph
          </Button>
        </div>
      </form>
    </Form>
  )
} 