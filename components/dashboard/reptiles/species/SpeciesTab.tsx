import { createSpecies, deleteSpecies, getSpecies, updateSpecies } from '@/app/api/reptiles/species'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useResource } from '@/lib/hooks/useResource'
import { NewSpecies, Species } from '@/lib/types/species'
import { useState } from 'react'
import { SpeciesForm } from './SpeciesForm'
import { SpeciesList } from './SpeciesList'

export function SpeciesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    resources: species,
    isLoading,
    selectedResource: selectedSpecies,
    setSelectedResource: setSelectedSpecies,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<Species, NewSpecies>({
    resourceName: 'Species',
    queryKey: ['species'],
    getResources: getSpecies,
    createResource: createSpecies,
    updateResource: updateSpecies,
    deleteResource: deleteSpecies,
  })


  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">

      <SpeciesList 
        species={species}
        onEdit={(speciesItem) => {
          setSelectedSpecies(speciesItem)
          setIsDialogOpen(true)
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
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