import { createSpecies, deleteSpecies, getSpecies, updateSpecies } from '@/app/api/reptiles/species'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useResource } from '@/lib/hooks/useResource'
import { NewSpecies, Species } from '@/lib/types/species'
import { useEffect, useState } from 'react'
import { ResourceList } from '../../ResourceList'
import { SpeciesCard } from './SpeciesCard'
import { SpeciesForm } from './SpeciesForm'

export function SpeciesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    resources: species,
    isLoading,
    selectedResource: selectedSpecies,
    setSelectedResource: setSelectedSpecies,
    loadResources,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Species, NewSpecies>({
    resourceName: 'Species',
    getResources: getSpecies,
    createResource: createSpecies,
    updateResource: updateSpecies,
    deleteResource: deleteSpecies,
  })

  useEffect(() => {
    loadResources()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Species
        </Button>
      </div>

      <ResourceList
        resources={species}
        isLoading={isLoading}
        renderItem={(species) => (
          <SpeciesCard
            species={species}
            onEdit={() => {
              setSelectedSpecies(species)
              setIsDialogOpen(true)
            }}
            onDelete={() => handleDelete(species.id)}
          />
        )}
        emptyMessage="No species found"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedSpecies ? 'Edit Species' : 'Add New Species'}
          </DialogTitle>
          <SpeciesForm
            initialData={selectedSpecies}
            onSubmit={async (data) => {
              const success = selectedSpecies
                ? await handleUpdate(data)
                : await handleCreate(data)
              if (success) {
                setIsDialogOpen(false)
                setSelectedSpecies(undefined)
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false)
              setSelectedSpecies(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 