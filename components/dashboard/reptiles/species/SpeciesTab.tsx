'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewSpecies, Species } from '@/lib/types/species';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { SpeciesForm } from './SpeciesForm';
import { SpeciesList } from './SpeciesList';

export function SpeciesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    species,
    isLoading: storeLoading,
    addSpecies,
    updateSpecies,
    deleteSpecies,
    fetchSpecies
  } = useSpeciesStore()
  
  const [selectedSpecies, setSelectedSpecies] = useState<Species | undefined>(undefined)

  // Use TanStack Query only for the initial load
  const { isLoading: queryLoading } = useQuery({
    queryKey: ['species-initial-load'],
    queryFn: async () => {
      // Only fetch if we don't have species in the store
      if (species.length === 0) {
        await fetchSpecies();
      }
      return species;
    },
    // Only run once on component mount
    enabled: species.length === 0,
    // Don't refetch on window focus or reconnect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't consider data stale
    staleTime: Infinity,
  });

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

  const isLoading = storeLoading || queryLoading;

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