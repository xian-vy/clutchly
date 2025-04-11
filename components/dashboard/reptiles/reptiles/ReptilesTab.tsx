'use client';

import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useResource } from '@/lib/hooks/useResource'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { useEffect, useState } from 'react'
import { ReptileList } from './ReptileList'
import { ReptileForm } from './ReptileForm'

export function ReptilesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    resources: reptiles,
    isLoading,
    selectedResource: selectedReptile,
    setSelectedResource: setSelectedReptile,
    loadResources,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  })

  useEffect(() => {
    loadResources()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <ReptileList 
        reptiles={reptiles}
        onEdit={(reptile) => {
          setSelectedReptile(reptile)
          setIsDialogOpen(true)
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedReptile ? 'Edit Reptile' : 'Add New Reptile'}
          </DialogTitle>
          <ReptileForm
            initialData={selectedReptile}
            onSubmit={async (data) => {
              const success = selectedReptile
                ? await handleUpdate(data)
                : await handleCreate(data)
              if (success) {
                setIsDialogOpen(false)
                setSelectedReptile(undefined)
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false)
              setSelectedReptile(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 