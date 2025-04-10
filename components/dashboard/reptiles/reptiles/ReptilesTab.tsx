import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useResource } from '@/lib/hooks/useResource'
import { NewReptile, Reptile } from '@/lib/types/reptile'
import { useEffect, useState } from 'react'
import { ResourceList } from '../../ResourceList'
import { ReptileCard } from './ReptileCard'
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Reptile
        </Button>
      </div>

      <ResourceList
        resources={reptiles}
        isLoading={isLoading}
        renderItem={(reptile) => (
          <ReptileCard
            reptile={reptile}
            onEdit={() => {
              setSelectedReptile(reptile)
              setIsDialogOpen(true)
            }}
            onDelete={() => handleDelete(reptile.id)}
          />
        )}
        emptyMessage="No reptiles found"
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