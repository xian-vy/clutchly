'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { useEffect, useState } from 'react'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { useMorphsStore } from '@/lib/stores/morphsStore'
import { useResource } from '@/lib/hooks/useResource'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  morph: z.string().min(1, 'Morph is required'),
  sex: z.enum(['male', 'female', 'unknown'] as const),
  hatch_date: z.string().nullable(),
  acquisition_date: z.string().min(1, 'Acquisition date is required'),
  status: z.enum(['active', 'sold', 'deceased'] as const),
  notes: z.string().nullable(),
  dam_id: z.string().nullable(),
  sire_id: z.string().nullable(),
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
  // Get species and morphs from the Zustand stores
  const { species, fetchSpecies } = useSpeciesStore()
  const { getMorphsBySpecies } = useMorphsStore()
  
  const [availableMorphs, setAvailableMorphs] = useState<{ id: string, name: string }[]>([])
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('')
  const [isLoadingMorphs, setIsLoadingMorphs] = useState(false)

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      species: initialData?.species || '',
      morph: initialData?.morph || '',
      sex: initialData?.sex || 'unknown',
      hatch_date: initialData?.hatch_date || null,
      acquisition_date: initialData?.acquisition_date || new Date().toISOString().split('T')[0],
      status: initialData?.status || 'active',
      notes: initialData?.notes || null,
      dam_id: initialData?.dam_id || null,
      sire_id: initialData?.sire_id || null,
    }
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const formattedData = {
      ...data,
      hatch_date: data.hatch_date || null,
      notes: data.notes || null
    }
    await onSubmit(formattedData)
  }

  useEffect(() => {
    // Fetch species if not already loaded
    if (species.length === 0) {
      fetchSpecies()
    }
  }, [species.length, fetchSpecies])

  // Update available morphs when species changes
  useEffect(() => {
    const speciesId = form.watch('species')
    if (speciesId) {
      setSelectedSpeciesId(speciesId)
      setIsLoadingMorphs(true)
      
      // Load morphs for the selected species
      const morphsForSpecies = getMorphsBySpecies(speciesId)
      setAvailableMorphs(morphsForSpecies.map(m => ({ id: m.id.toString(), name: m.name })))
      setIsLoadingMorphs(false)
    }
  }, [form.watch('species'), getMorphsBySpecies])

  const males = reptiles.filter(r => r.sex === 'male')
  const females = reptiles.filter(r => r.sex === 'female')

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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value)
                  // Reset morph when species changes
                  form.setValue('morph', '')
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
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

          <FormField
            control={form.control}
            name="morph"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Morph</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedSpeciesId || isLoadingMorphs}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={isLoadingMorphs ? "Loading..." : "Select morph"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableMorphs.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dam_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dam (Female Parent)</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isReptilesLoading}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a reptile" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isReptilesLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      females.map((reptile) => (
                        <SelectItem key={reptile.id} value={reptile.id}>
                          {reptile.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sire_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sire (Male Parent)</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isReptilesLoading}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a reptile" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isReptilesLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      males.map((reptile) => (
                        <SelectItem key={reptile.id} value={reptile.id}>
                          {reptile.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex justify-end gap-4">
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