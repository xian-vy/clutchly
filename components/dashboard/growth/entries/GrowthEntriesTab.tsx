'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { GrowthEntry, CreateGrowthEntryInput } from '@/lib/types/growth';
import { 
  getGrowthEntries, 
  createGrowthEntry, 
  updateGrowthEntry, 
  deleteGrowthEntry 
} from '@/app/api/growth/entries';
import { GrowthEntryList } from './GrowthEntryList';
import { GrowthEntryForm } from './GrowthEntryForm';


export function GrowthEntriesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    resources: growthEntries,
    isLoading,
    selectedResource: selectedGrowthEntry,
    setSelectedResource: setSelectedGrowthEntry,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<GrowthEntry, CreateGrowthEntryInput>({
    resourceName: 'Growth Entry',
    queryKey: ['growthEntries'],
    getResources: getGrowthEntries,
    createResource: createGrowthEntry,
    updateResource: updateGrowthEntry,
    deleteResource: deleteGrowthEntry,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <GrowthEntryList 
        growthEntries={growthEntries}
        onEdit={(growthEntry) => {
          setSelectedGrowthEntry(growthEntry);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedGrowthEntry ? 'Edit Growth Entry' : 'Add New Growth Entry'}
          </DialogTitle>
          <GrowthEntryForm
            initialData={selectedGrowthEntry}
            onSubmit={async (data) => {
              try {
                const success = selectedGrowthEntry
                  ? await handleUpdate(data)
                  : await handleCreate(data);
                if (success) {
                  setIsDialogOpen(false);
                  setSelectedGrowthEntry(undefined);
                }
              } catch (error) {
                console.error('Error submitting growth entry:', error);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedGrowthEntry(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 