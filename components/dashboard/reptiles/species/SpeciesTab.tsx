'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewSpecies, Species } from '@/lib/types/species';
import {  useState } from 'react';
import { SpeciesForm } from './SpeciesForm';
import { SpeciesList } from './SpeciesList';
import { Loader2 } from 'lucide-react';

export function SpeciesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    species,
    isLoading: storeLoading,
    addSpecies,
    updateSpecies,
    deleteSpecies,
  } = useSpeciesStore()
  
  const [selectedSpecies, setSelectedSpecies] = useState<Species | undefined>(undefined)

  

  const handleCreate = async (data: NewSpecies) => {
    const result = await addSpecies(data)
    if (result) {
      setIsDialogOpen(false)
      return true
    }
    return false
  }

  const handleUpdate = async (data: NewSpecies) => {
    if (!selectedSpecies) return false
    const result = await updateSpecies(selectedSpecies.id.toString(), data)
    if (result) {
      setIsDialogOpen(false)
      setSelectedSpecies(undefined)
      return true
    }
    return false
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this species?')) return
    await deleteSpecies(id)
  }

  const isLoading = storeLoading

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
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