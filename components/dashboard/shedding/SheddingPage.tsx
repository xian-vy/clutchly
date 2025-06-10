'use client'

import { useState } from 'react'
import { useResource } from '@/lib/hooks/useResource'
import { getSheddingRecords, updateShedding, deleteShedding, createShedding, createBatchShedding } from '@/app/api/shedding/shedding'
import { SheddingWithReptile, CreateSheddingInput, UpdateSheddingInput } from '@/lib/types/shedding'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { NewSheddingDialog } from './NewSheddingDialog'
import { EditSheddingDialog } from './EditSheddingDialog'
import { SheddingList } from './SheddingList'
import { getCurrentMonthDateRange } from '@/lib/utils'
import { SheddingFilters } from './SheddingFilterDialog'

export function SheddingPage() {
  const queryClient = useQueryClient()
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const currentMonthRange = getCurrentMonthDateRange()
  const [filters, setFilters] = useState<SheddingFilters>({
    dateRange: [currentMonthRange.dateFrom, currentMonthRange.dateTo],
  })

  const {
    resources: sheddingRecords,
    isLoading,
    handleCreate: handleCreateShedding,
    handleDelete,
    handleUpdate,
    setSelectedResource,
    selectedResource
  } = useResource<SheddingWithReptile, UpdateSheddingInput>({
    resourceName: 'Shedding',
    queryKey: ['shedding', filters.dateRange],
    getResources: () => getSheddingRecords({
      startDate: filters.dateRange?.[0] || currentMonthRange.dateFrom,
      endDate: filters.dateRange?.[1] || currentMonthRange.dateTo
    }),
    createResource: async (data) => {
      if (!data.reptile_id) {
        throw new Error('Reptile ID is required')
      }
      return createShedding(data as CreateSheddingInput)
    },
    updateResource: updateShedding,
    deleteResource: deleteShedding,
  })

  const handleCreate = async (data: CreateSheddingInput): Promise<void> => {
    const success = await handleCreateShedding(data)
    if (!success) {
      throw new Error('Failed to create shedding record')
    }
    setIsNewDialogOpen(false)
  }

  const handleBatchCreate = async (data: CreateSheddingInput[]): Promise<boolean> => {
    try {
      await createBatchShedding(data)
      await queryClient.invalidateQueries({ queryKey: ['shedding'] })
      toast.success('Batch shedding records created successfully')
      setIsNewDialogOpen(false)
      return true
    } catch (error) {
      console.error('Failed to create batch shedding records:', error)
      toast.error('Failed to create batch shedding records')
      return false
    }
  }

  return (
    <div className="space-y-4">
      <SheddingList
          sheddingRecords={sheddingRecords}
          isLoading={isLoading}
          onEdit={setSelectedResource}
          onDelete={handleDelete}
          onAddNew={() => setIsNewDialogOpen(true)}
          filters={filters}
          onFiltersChange={setFilters}
       />
      <NewSheddingDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onSubmit={handleCreate}
        onBatchSubmit={handleBatchCreate}
      />
       <EditSheddingDialog
          shedding={selectedResource}
          open={!!selectedResource}
          onOpenChange={(open) => !open && setSelectedResource(undefined)}
          onSubmit={async (data) => {
            try {
              const success = await handleUpdate(data)
              if (success) {
                setSelectedResource(undefined)
                return true
              }
              return false
            } catch (error) {
              console.error('SheddingList: Failed to update shedding record:', error)
              return false
            }
          }}
        />
    </div>
  )
} 