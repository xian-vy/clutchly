'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreateSheddingInput } from '@/lib/types/shedding'
import { Reptile } from '@/lib/types/reptile'
import { getRooms } from '@/app/api/locations/rooms'
import { getRacksByRoom } from '@/app/api/locations/racks'
import { getReptilesByLocation } from '@/app/api/shedding/shedding'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

const formSchema = z.object({
  reptile_ids: z.array(z.string()).min(1, 'Please select at least one reptile'),
  shed_date: z.string().min(1, 'Please select a date'),
  completeness: z.enum(['full', 'partial', 'retained', 'unknown'], {
    required_error: 'Please select completeness',
  }),
  notes: z.string().optional(),
  photo_url: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  onSubmit: (data: CreateSheddingInput[]) => Promise<boolean>
  onOpenChange: (open: boolean) => void
}

interface ReptileWithLocationFromAPI extends Reptile {
  location: {
    id: string;
    label: string;
    rack: {
      id: string;
      name: string;
      room: {
        id: string;
        name: string;
      };
    };
  } | null;
}

export function BatchSheddingForm({ onSubmit, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [selectedRack, setSelectedRack] = useState<string>('all')

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_ids: [],
      shed_date: new Date().toISOString().split('T')[0],
      notes: '',
      photo_url: '',
    },
  })

  const { data: reptiles } = useQuery({
    queryKey: ['reptiles', 'all'],
    queryFn: async () => {
      let data;
      if (selectedRoom === 'all' && selectedRack === 'all') {
        // Get all reptiles
        data = await getReptilesByLocation('room', 'all')
      } else if (selectedRoom !== 'all' && selectedRack === 'all') {
        // Get reptiles by room
        data = await getReptilesByLocation('room', selectedRoom)
      } else if (selectedRack !== 'all') {
        // Get reptiles by rack
        data = await getReptilesByLocation('rack', selectedRack)
      } else {
        return []
      }
      return (data as unknown) as ReptileWithLocationFromAPI[]
    },
  })

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  })

  const { data: racks } = useQuery({
    queryKey: ['racks', selectedRoom],
    queryFn: async () => {
      if (selectedRoom === 'all') return []
      return getRacksByRoom(selectedRoom)
    },
    enabled: !!selectedRoom && selectedRoom !== 'all',
  })

  const onSubmitForm = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const sheddingRecords = data.reptile_ids.map(reptile_id => ({
        reptile_id,
        shed_date: data.shed_date,
        completeness: data.completeness,
        notes: data.notes,
        photo_url: data.photo_url,
      }))

      const success = await onSubmit(sheddingRecords)
      if (success) {
        form.reset()
        setSelectedRoom('all')
        setSelectedRack('all')
        toast.success('Batch shedding records created successfully')
      }
    } catch (error) {
      console.error('Failed to create batch shedding records:', error)
      toast.error('Failed to create batch shedding records')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReptiles = reptiles?.filter(reptile => {
    if (selectedRoom === 'all' && selectedRack === 'all') return true
    if (!reptile.location) return false
    if (selectedRoom !== 'all' && reptile.location.rack.room.id !== selectedRoom) return false
    if (selectedRack !== 'all' && reptile.location.rack.id !== selectedRack) return false
    return true
  })

  const handleSelectAll = () => {
    const allIds = filteredReptiles?.map(r => r.id) || []
    form.setValue('reptile_ids', allIds)
  }

  const handleDeselectAll = () => {
    form.setValue('reptile_ids', [])
  }

  return (
     <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Filter by Location</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={selectedRoom}
                    onValueChange={(value) => {
                      setSelectedRoom(value)
                      setSelectedRack('all')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rooms</SelectItem>
                      {rooms?.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedRack}
                    onValueChange={setSelectedRack}
                    disabled={selectedRoom === 'all'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Racks</SelectItem>
                      {racks?.map((rack) => (
                        <SelectItem key={rack.id} value={rack.id}>
                          {rack.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Reptile Selection</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="reptile_ids"
              render={() => (
                <FormItem>
                  <FormControl>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      <div className="space-y-2">
                        {filteredReptiles?.map((reptile) => (
                          <div
                            key={reptile.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={reptile.id}
                              checked={form.watch('reptile_ids').includes(reptile.id)}
                              onCheckedChange={(checked) => {
                                const currentIds = form.watch('reptile_ids')
                                if (checked) {
                                  form.setValue('reptile_ids', [...currentIds, reptile.id])
                                } else {
                                  form.setValue(
                                    'reptile_ids',
                                    currentIds.filter((id) => id !== reptile.id)
                                  )
                                }
                              }}
                            />
                            <label
                              htmlFor={reptile.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {reptile.name}
                              {reptile.reptile_code ? ` (${reptile.reptile_code})` : ''}
                              {/* {reptile.location
                                ? ` - ${reptile.location.rack.room.name} > ${reptile.location.rack.name} > ${reptile.location.label}`
                                : ''} */}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </FormControl>
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
                <FormItem>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Batch Shedding Records'}
              </Button>
            </div>
          </form>
        </Form>

  )
} 