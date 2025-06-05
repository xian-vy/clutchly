'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CreateSheddingInput } from '@/lib/types/shedding'
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect'
import { useQuery } from '@tanstack/react-query'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  reptile_id: z.string().min(1, 'Please select a reptile'),
  shed_date: z.string().min(1, 'Please select a date'),
  completeness: z.enum(['full', 'partial', 'retained', 'unknown'], {
    required_error: 'Please select completeness',
  }),
  notes: z.string().optional(),
  photo_url: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  onSubmit: (data: CreateSheddingInput) => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function IndividualSheddingForm({  onSubmit,onOpenChange }: Props) {

  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })

  const activeReptiles = reptiles.filter((reptile) => reptile.status === 'active')
  const { ReptileSelect } = useGroupedReptileSelect({ filteredReptiles: activeReptiles })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_id: '',
      shed_date: new Date().toISOString().split('T')[0],
      notes: '',
      photo_url: '',
    },
  })
  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Failed to create shedding record:', error)
      toast.error('Failed to create shedding record')
    }
  }

  return (

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="reptile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reptile</FormLabel>
                  <FormControl>
                    <ReptileSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select a reptile"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shed_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shed Date</FormLabel>
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
              name="completeness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completeness</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select completeness" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full">Full Shed</SelectItem>
                      <SelectItem value="partial">Partial Shed</SelectItem>
                      <SelectItem value="retained">Retained Shed</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about the shedding..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo_url"
              render={({ field }) => (
                <FormItem className='hidden'>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter URL to shedding photo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Saving...' : 'Create Shedding Record'}
              </Button>
            </div>
          </form>
        </Form>

  )
} 