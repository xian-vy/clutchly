'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/stores/authStore'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { Morph, NewMorph } from '@/lib/types/morph'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species_id: z.string().min(1, 'Species is required'),
  description : z.string().nullable(),
})

interface MorphFormProps {
  initialData?: Morph & { species: { name: string } }
  onSubmit: (data: NewMorph) => Promise<void>
  onCancel: () => void
}

type FormValues = {
  name: string
  species_id: string
  description: string | null
}

export function MorphForm({ initialData, onSubmit, onCancel }: MorphFormProps) {
 
  // Get species from the Zustand store
  const { species, fetchSpecies } = useSpeciesStore()
  const { organization } = useAuthStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      species_id: initialData?.species_id?.toString() || '',
      description: initialData?.description || "",
    }
  })
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (species.length !== 0) return
    if (!organization) return;
     fetchSpecies(organization)
  }, [species.length, fetchSpecies,organization])

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({
      ...data,
      species_id: parseInt(data.species_id, 10),
      description: data.description || "",
    })
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input  {...field} value={field.value || ''} />
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

       
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'} Morph
          </Button>
        </div>
      </form>
    </Form>
  )
} 