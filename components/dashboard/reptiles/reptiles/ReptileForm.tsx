'use client'

import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { LocationSelect } from '@/components/dashboard/locations/LocationSelect'
import { useReptilesParentsBySpecies } from '@/lib/hooks/useReptilesParentsBySpecies'
import { useResource } from '@/lib/hooks/useResource'
import { useSelectList } from '@/lib/hooks/useSelectList'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { HetTraitsForm } from './HetTraitsForm'
import { VisualTraitsForm } from './VisualTraitsForm'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species_id: z.string().min(1, 'Species is required'),
  morph_id: z.string().min(1, 'Morph is required'),
  sex: z.enum(['male', 'female', 'unknown'] as const),
  hatch_date: z.string().nullable(),
  acquisition_date: z.string().min(1, 'Acquisition date is required'),
  status: z.enum(['active', 'sold', 'deceased'] as const),
  notes: z.string().nullable(),
  dam_id: z.string().nullable(),
  sire_id: z.string().nullable(),
  weight: z.coerce.number().min(0, 'Weight must be a positive number'),
  length: z.coerce.number().min(0, 'Length must be a positive number'),
  visual_traits: z.array(z.string()).nullable(),
  het_traits: z.array(z.object({
    trait: z.string(),
    percentage: z.number().min(0).max(100),
    source: z.enum(['visual_parent', 'genetic_test', 'breeding_odds']).optional(),
    verified: z.boolean().optional()
  })).nullable(),
  location_id: z.string().nullable(),
})

// Extended Reptile type with species_name and morph_name
interface EnrichedReptile extends Reptile {
  species_name?: string;
  morph_name?: string;
}

interface ReptileFormProps {
  initialData?: EnrichedReptile
  onSubmit: (data: NewReptile) => Promise<void>
  onCancel: () => void
}

export function ReptileForm({ initialData, onSubmit, onCancel }: ReptileFormProps) {
  const { species, fetchSpecies } = useSpeciesStore()

  const { 
    resources: reptiles, 
    isLoading: isReptilesLoading 
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  // State for managing visual traits and het traits
  const [visualTraits, setVisualTraits] = useState<string[]>(initialData?.visual_traits || []);
  const [hetTraits, setHetTraits] = useState<Array<{
    trait: string;
    percentage: number;
    source?: 'visual_parent' | 'genetic_test' | 'breeding_odds';
    verified?: boolean;
  }>>(initialData?.het_traits || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      species_id: initialData?.species_id.toString() || '',
      morph_id: initialData?.morph_id.toString() || '',
      sex: initialData?.sex || 'unknown',
      hatch_date: initialData?.hatch_date || null,
      acquisition_date: initialData?.acquisition_date || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'active',
      notes: initialData?.notes || null,
      dam_id: initialData?.dam_id || null,
      sire_id: initialData?.sire_id || null,
      weight: initialData?.weight || 0,
      length: initialData?.length || 0,
      visual_traits: initialData?.visual_traits || [],
      het_traits: initialData?.het_traits || [],
      location_id: initialData?.location_id || null,
    }
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const formattedData = {
      ...data,
      hatch_date: data.hatch_date || null,
      notes: data.notes || null,
      visual_traits: visualTraits,
      het_traits: hetTraits,
      location_id: data.location_id || null,
    }
    await onSubmit(formattedData)
  }

  useEffect(() => {
    // Fetch species if not already loaded
    if (species.length === 0) {
      fetchSpecies()
    }
  }, [species.length, fetchSpecies])

  const speciesId = form.watch('species_id');
  const { selectedSpeciesId, maleReptiles, femaleReptiles, morphsForSpecies } = useReptilesParentsBySpecies({
    reptiles,
    speciesId : speciesId || '',
  });

  const { Select: SpeciesSelect } = useSelectList({
    data: species,
    getValue: (species) => species.id.toString(),
    getLabel: (species) => species.name,
  })
  const { Select: MorphSelect } = useSelectList({
    data: morphsForSpecies,
    getValue: (morph) => morph.id.toString(),
    getLabel: (morph) => morph.name,
    disabled : !selectedSpeciesId 
  })
  const { Select: SireSelect } = useSelectList({
    data: maleReptiles,
    getValue: (reptile) => reptile.id.toString(),
    getLabel: (reptile) => reptile.name,
    disabled: isReptilesLoading || !selectedSpeciesId 
  })
  const { Select: DamSelect } = useSelectList({
    data: femaleReptiles,
    getValue: (reptile) => reptile.id.toString(),
    getLabel: (reptile) => reptile.name,
    disabled: isReptilesLoading || !selectedSpeciesId 
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" >
          <TabsList >
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="visual-traits">Visual Traits</TabsTrigger>
            <TabsTrigger value="het-traits">Het Traits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-3 2xl:space-y-5 mt-4">
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

            <div className="grid grid-cols-2 2xl:grid-cols-4 gap-3  2xl:gap-5">
              <FormField
                    control={form.control}
                    name="species_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Species</FormLabel>
                        <FormControl>
                          <SpeciesSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select a Species"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="morph_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Morph</FormLabel>
                        <FormControl>
                          <MorphSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select a Morph"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
     
                <FormField
                    control={form.control}
                    name="dam_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dam (Optional)</FormLabel>
                        <FormControl>
                          <DamSelect
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            placeholder="Select a Parent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sire_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sire (Optional)</FormLabel>
                        <FormControl>
                          <SireSelect
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            placeholder="Select a Parent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
         
              <FormField
                control={form.control}
                name="hatch_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hatch Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acquisition_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Housing (Optional)</FormLabel>
                    <FormControl>
                      <LocationSelect 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        currentLocationId={initialData?.location_id}
                        filterByAvailability
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          
          <TabsContent value="visual-traits" className="mt-4">
            <Card className="p-4 shadow-none">
              <VisualTraitsForm 
                initialTraits={visualTraits} 
                onChange={setVisualTraits} 
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="het-traits" className="mt-4">
            <Card className="p-4 shadow-none">
              <HetTraitsForm 
                initialTraits={hetTraits} 
                onChange={setHetTraits} 
              />
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Reptile
          </Button>
        </div>
      </form>
    </Form>
  )
}