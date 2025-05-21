'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SheddingList } from './SheddingList'
import { SheddingReports } from './SheddingReports'
import { useResource } from '@/lib/hooks/useResource'
import { getSheddingRecords, updateShedding, deleteShedding, createShedding, createBatchShedding } from '@/app/api/shedding/shedding'
import { SheddingWithReptile, CreateSheddingInput, UpdateSheddingInput } from '@/lib/types/shedding'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { NewSheddingDialog } from './NewSheddingDialog'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export function SheddingPage() {
  const queryClient = useQueryClient()
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)

  const {
    resources: sheddingRecords,
    isLoading,
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

  const handleDeleteWithConfirmation = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this shedding record?')) {
      await handleDelete(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
          <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:!text-3xl font-bold">Shed Management</h1>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
            Options
          </Button>
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
            onUpdate={handleUpdate}
            onDelete={handleDeleteWithConfirmation}
            onAddNew={() => setIsNewDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <SheddingReports />
        </TabsContent>
      </Tabs>

      <NewSheddingDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onSubmit={handleCreate}
        onBatchSubmit={handleBatchCreate}
      />
    </div>
  )
} 