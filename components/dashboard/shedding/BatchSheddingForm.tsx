'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreateSheddingInput } from '@/lib/types/shedding'
import { getRooms } from '@/app/api/locations/rooms'
import { getRacksByRoom } from '@/app/api/locations/racks'
import { getReptiles } from '@/app/api/reptiles/reptiles'
import { getLocations, getLocationDetails } from '@/app/api/locations/locations'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { DetailsSection } from './components/batch/DetailsSection'
import { FiltersSection } from './components/batch/FiltersSection'
import { ReptileSelection } from './components/batch/ReptileSelection'
import { FormData, FilterState, ReptileWithLocation, formSchema } from './components/batch/types'

interface Props {
  onSubmit: (data: CreateSheddingInput[]) => Promise<boolean>
  onOpenChange: (open: boolean) => void
}

export function BatchSheddingForm({ onSubmit, onOpenChange }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    room: 'all',
    rack: 'all',
    ageGroup: 'all'
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reptile_ids: [],
      shed_date: new Date().toISOString().split('T')[0],
      notes: '',
      photo_url: '',
    },
  })

  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
  })

  const { data: locationDetails = [] } = useQuery({
    queryKey: ['location-details', locations.map(l => l.id)],
    queryFn: async () => {
      const details = await Promise.all(
        locations.map(loc => getLocationDetails(loc.id))
      )
      return details
    },
    enabled: locations.length > 0,
  })

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  })

  const { data: racks } = useQuery({
    queryKey: ['racks', filters.room],
    queryFn: async () => {
      if (filters.room === 'all') return []
      return getRacksByRoom(filters.room)
    },
    enabled: !!filters.room && filters.room !== 'all',
  })

  // Combine reptiles with their locations
  const reptilesWithLocations: ReptileWithLocation[] = reptiles.map(reptile => {
    const locationDetail = reptile.location_id 
      ? locationDetails.find(detail => detail.id === reptile.location_id)
      : null

    return {
      ...reptile,
      location: locationDetail ? {
        id: locationDetail.id,
        label: locationDetail.label,
        rack: {
          id: locationDetail.rack_id,
          name: locationDetail.racks?.name || 'Unknown Rack',
          room: {
            id: locationDetail.room_id,
            name: locationDetail.rooms?.name || 'Unknown Room'
          }
        }
      } : null
    }
  })

  // Calculate age groups based on reptile data
  const ageGroups = useMemo(() => {
    return [
      { id: 'all', label: 'All Ages' },
      { id: 'hatchling', label: 'Hatchling (< 3 months)' },
      { id: 'juvenile', label: 'Juvenile (3-6 months)' },
      { id: 'subadult', label: 'Subadult (6-12 months)' },
      { id: 'adult', label: 'Adult (> 12 months)' }
    ]
  }, [])

  // Filter reptiles based on all criteria
  const filteredReptiles = reptilesWithLocations.filter(reptile => {
    // Location filters
    if (!reptile.location) return false
    if (filters.room !== 'all' && reptile.location.rack.room.id !== filters.room) return false
    if (filters.rack !== 'all' && reptile.location.rack.id !== filters.rack) return false

    // Age group filter
    if (filters.ageGroup !== 'all') {
      const age = reptile.hatch_date ? 
        (new Date().getTime() - new Date(reptile.hatch_date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 0
      
      if (filters.ageGroup === 'hatchling' && age >= 3) return false
      if (filters.ageGroup === 'juvenile' && (age < 3 || age >= 6)) return false
      if (filters.ageGroup === 'subadult' && (age < 6 || age > 12)) return false
      if (filters.ageGroup === 'adult' && age <= 12) return false
    }

    return true
  })

  const onSubmitForm = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const sheddingRecords = data.reptile_ids.map((reptile_id: string) => ({
        reptile_id,
        shed_date: data.shed_date,
        completeness: data.completeness,
        notes: data.notes,
        photo_url: data.photo_url,
      }))

      const success = await onSubmit(sheddingRecords)
      if (success) {
        form.reset()
        setFilters({
          room: 'all',
          rack: 'all',
          ageGroup: 'all'
        })
        toast.success('Batch shedding records created successfully')
      }
    } catch (error) {
      console.error('Failed to create batch shedding records:', error)
      toast.error('Failed to create batch shedding records')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAll = () => {
    const allIds = filteredReptiles?.map(r => r.id) || []
    form.setValue('reptile_ids', allIds)
  }

  const handleDeselectAll = () => {
    form.setValue('reptile_ids', [])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-3">
        <DetailsSection form={form} />

        <FiltersSection
          filters={filters}
          setFilters={setFilters}
          rooms={rooms}
          racks={racks}
          ageGroups={ageGroups}
        />

        <ReptileSelection
          form={form}
          filteredReptiles={filteredReptiles}
          isDialogOpen={isDialogOpen}
          onDialogOpenChange={setIsDialogOpen}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
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