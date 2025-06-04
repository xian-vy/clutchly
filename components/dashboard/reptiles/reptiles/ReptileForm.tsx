'use client'

import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useReptilesParentsBySpecies } from '@/lib/hooks/useReptilesParentsBySpecies'
import { useResource } from '@/lib/hooks/useResource'
import { useSelectList } from '@/lib/hooks/useSelectList'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { NewReptile, Reptile, Sex } from '@/lib/types/reptile'
import { generateReptileCode, getSpeciesCode } from '@/components/dashboard/reptiles/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { HetTraitsForm } from './HetTraitsForm'
import { VisualTraitsForm } from './VisualTraitsForm'
import { Organization } from '@/lib/types/organizations'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().nullable(),
  reptile_code: z.string().nullable(),
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
  original_breeder : z.string().nullable(),
  price: z.coerce.number().min(0, 'Price must be a positive number').nullable(),})

// Extended Reptile type with species_name and morph_name
interface EnrichedReptile extends Reptile {
  species_name?: string;
  morph_name?: string;
}

interface ReptileFormProps {
  initialData?: EnrichedReptile
  onSubmit: (data: NewReptile) => Promise<void>
  onCancel: () => void
  organization : Organization | undefined
}

export function ReptileForm({ initialData, onSubmit, onCancel,organization }: ReptileFormProps) {
  const { species, fetchSpecies } = useSpeciesStore()
  const [isLoading, setLoading] = useState(false)
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

  // Initialize form with default values, preselecting first species and morph if no initialData
  const defaultSpeciesId = initialData?.species_id.toString() || (species.length > 0 ? species[0].id.toString() : '');
  const actualProfile = Array.isArray(organization) ? organization[0] : organization;
  const defaultBreeder = initialData?.original_breeder || actualProfile?.full_name || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      reptile_code: initialData?.reptile_code || null,
      species_id: defaultSpeciesId,
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
      original_breeder : defaultBreeder,
      price : initialData?.price || 0,
    }
  });
  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    const formattedData = {
      ...data,
      // If name is empty, use reptile_code as name
      name: data.name || data.reptile_code || '',
      hatch_date: data.hatch_date || null,
      notes: data.notes || null,
      visual_traits: visualTraits,
      het_traits: hetTraits,
      location_id: data.location_id || null,
    }
    await onSubmit(formattedData)
    setLoading(false)
  }

  useEffect(() => {
    // Fetch species if not already loaded
    if (species.length === 0) {
      fetchSpecies()
    }
  }, [species.length, fetchSpecies])

  const speciesId = form.watch('species_id');
  const morphId = form.watch('morph_id');
  const sex = form.watch('sex');
  const hatchDate = form.watch('hatch_date');
  
  const { selectedSpeciesId, maleReptiles, femaleReptiles, morphsForSpecies } = useReptilesParentsBySpecies({
    reptiles,
    speciesId : speciesId || '',
  });

  // Select first morph when species changes or when component first loads
  useEffect(() => {
    if (morphsForSpecies.length > 0 && !initialData) {
      form.setValue('morph_id', morphsForSpecies[0].id.toString());
    }
  }, [morphsForSpecies, form, initialData]);

  // Auto-generate reptile code when relevant fields change
  useEffect(() => {
    // Only auto-generate code for new reptiles (not when editing)
    if (initialData) return;
    
    const selectedSpecies = species.find(s => s.id.toString() === speciesId);
    const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId);
    
    if (selectedSpecies && selectedMorph) {
      // Use utility function to get species code
      const speciesCode = getSpeciesCode(selectedSpecies.name);
      
      // Add a temporary unique reptile to the list to ensure unique sequence numbers
      // This helps when multiple forms are open at once
      const uniqueReptiles = [
        ...(reptiles || []),
        { id: 'temp_' + Date.now().toString() } as unknown as Reptile // Add a temporary reptile to bump the sequence
      ];
      
      // Use utility function to generate the reptile code
      const generatedCode = generateReptileCode(
        uniqueReptiles,
        speciesCode,
        selectedMorph.name,
        hatchDate,
        sex as Sex
      );
      
      form.setValue('reptile_code', generatedCode);
    }
  }, [speciesId, morphId, sex, hatchDate, form, reptiles, species, morphsForSpecies, initialData]);

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
            <TabsTrigger value="basic">Info</TabsTrigger>
            <TabsTrigger value="visual-traits">Visual Traits</TabsTrigger>
            <TabsTrigger value="het-traits">Het Traits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-2 sm:space-y-3 xl:space-y-5 mt-2 sm:mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xl:gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reptile_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code <span className='text-[0.55rem] md:text-[0.6arem]'>(SEQ_SP_MORPH_HATCHYEAR_GENDER)</span></FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3  xl:gap-5 h-[200px] md:h-full overflow-auto">
                <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                {...field}
                                value={field.value ?? ''} 
                              />
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
                name="original_breeder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Breeder</FormLabel>
                    <FormControl>
                      <Input value={field.value || ''} onChange={field.onChange} />
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

        <div className="flex justify-end gap-4 mt-3 md:mt-5">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            {initialData ? 'Update' : 'Create'} Reptile
            {isLoading && <Loader2 className='ml-2 w-4 h-4 animate-spin' />}
          </Button>
        </div>
      </form>
    </Form>
  )
}