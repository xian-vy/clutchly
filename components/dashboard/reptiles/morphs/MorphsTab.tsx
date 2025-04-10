import { createMorph, deleteMorph, getMorphs, updateMorph } from '@/app/api/reptiles/morphs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useResource } from '@/lib/hooks/useResource'
import { Morph, NewMorph } from '@/lib/types/morph'
import { useEffect, useState } from 'react'
import { ResourceList } from '../../ResourceList'
import { MorphCard } from './MorphCard'
import { MorphForm } from './MorphForm'

type MorphWithSpecies = Morph & { species: { name: string } }

export function MorphsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    resources: morphs,
    isLoading,
    selectedResource: selectedMorph,
    setSelectedResource: setSelectedMorph,
    loadResources,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<MorphWithSpecies, NewMorph>({
    resourceName: 'Morph',
    getResources: getMorphs,
    createResource: createMorph,
    updateResource: updateMorph,
    deleteResource: deleteMorph,
  })

  useEffect(() => {
    loadResources()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Morph
        </Button>
      </div>

      <ResourceList
        resources={morphs}
        isLoading={isLoading}
        renderItem={(morph) => (
          <MorphCard
            morph={morph}
            onEdit={() => {
              setSelectedMorph(morph)
              setIsDialogOpen(true)
            }}
            onDelete={() => handleDelete(morph.id)}
          />
        )}
        emptyMessage="No morphs found"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedMorph ? 'Edit Morph' : 'Add New Morph'}
          </DialogTitle>
          <MorphForm
            initialData={selectedMorph}
            onSubmit={async (data) => {
              const success = selectedMorph
                ? await handleUpdate(data)
                : await handleCreate(data)
              if (success) {
                setIsDialogOpen(false)
                setSelectedMorph(undefined)
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false)
              setSelectedMorph(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 