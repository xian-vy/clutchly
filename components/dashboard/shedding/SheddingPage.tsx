'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SheddingList } from './SheddingList'
import { IndividualSheddingForm } from './IndividualSheddingForm'
import { BatchSheddingForm } from './BatchSheddingForm'
import { SheddingReports } from './SheddingReports'
import { useResource } from '@/lib/hooks/useResource'
import { getSheddingRecords, updateShedding, deleteShedding, createShedding, createBatchShedding } from '@/app/api/shedding/shedding'
import { SheddingWithReptile, CreateSheddingInput, UpdateSheddingInput } from '@/lib/types/shedding'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function SheddingPage() {
  const queryClient = useQueryClient()
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false)
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)

  const {
    resources: sheddingRecords,
    isLoading,
    selectedResource,
    setSelectedResource,
    handleCreate: handleCreateShedding,
    handleUpdate,
    handleDelete,
  } = useResource<SheddingWithReptile, UpdateSheddingInput>({
    resourceName: 'Shedding',
    queryKey: ['shedding'],
    getResources: getSheddingRecords,
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
  }

  const handleBatchCreate = async (data: CreateSheddingInput[]): Promise<boolean> => {
    try {
      await createBatchShedding(data)
      await queryClient.invalidateQueries({ queryKey: ['shedding'] })
      toast.success('Batch shedding records created successfully')
      return true
    } catch (error) {
      console.error('Failed to create batch shedding records:', error)
      toast.error('Failed to create batch shedding records')
      return false
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shedding Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsIndividualDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Log Individual Shed
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBatchDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Log Batch Shed
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Shed List</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <SheddingList
            sheddingRecords={sheddingRecords}
            isLoading={isLoading}
            selectedResource={selectedResource}
            setSelectedResource={setSelectedResource}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <SheddingReports />
        </TabsContent>
      </Tabs>

      <IndividualSheddingForm
        open={isIndividualDialogOpen}
        onOpenChange={setIsIndividualDialogOpen}
        onSubmit={handleCreate}
      />

      <BatchSheddingForm
        open={isBatchDialogOpen}
        onOpenChange={setIsBatchDialogOpen}
        onSubmit={handleBatchCreate}
      />
    </div>
  )
} 