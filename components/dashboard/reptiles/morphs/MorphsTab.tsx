'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Morph, NewMorph } from '@/lib/types/morph';
import { useState } from 'react';
import { MorphForm } from './MorphForm';
import { MorphList } from './MorphList';
import { Loader2 } from 'lucide-react';

type MorphWithSpecies = Morph & { species: { name: string } }

export function MorphsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const {
    morphs,
    isLoading: storeLoading,
    addMorph,
    updateMorph,
    deleteMorph,
  } = useMorphsStore()
  
  const [selectedMorph, setSelectedMorph] = useState<MorphWithSpecies | undefined>(undefined)

  const handleCreate = async (data: NewMorph) => {
    const result = await addMorph(data)
    if (result) {
      setIsDialogOpen(false)
      return true
    }
    return false
  }

  const handleUpdate = async (data: NewMorph) => {
    if (!selectedMorph) return false
    const result = await updateMorph(selectedMorph.id.toString(), data)
    if (result) {
      setIsDialogOpen(false)
      setSelectedMorph(undefined)
      return true
    }
    return false
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this morph?')) return
    await deleteMorph(id)
  }

  const isLoading = storeLoading;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <MorphList 
        morphs={morphs}
        onEdit={(morph) => {
          setSelectedMorph(morph)
          setIsDialogOpen(true)
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
        // onDownload={() => {}}
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