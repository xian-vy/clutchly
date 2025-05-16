'use client';

import { createCatalogEntry, deleteCatalogEntry, getCatalogEntries, updateCatalogEntry } from '@/app/api/catalog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { CatalogEntry, NewCatalogEntry } from '@/lib/types/catalog';
import { Reptile } from '@/lib/types/reptile';
import { useState } from 'react';
import { CatalogEntryForm } from './CatalogEntryForm';
import { CatalogEntryList } from './CatalogEntryList'
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Loader2 } from 'lucide-react';

export function CatalogTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    resources: catalogEntries,
    isLoading: catalogEntriesLoading,
    selectedResource: selectedCatalogEntry,
    setSelectedResource: setSelectedCatalogEntry,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<CatalogEntry, NewCatalogEntry>({
    resourceName: 'Catalog Entry',
    queryKey: ['catalog-entries'],
    getResources: getCatalogEntries,
    createResource: createCatalogEntry,
    updateResource: updateCatalogEntry,
    deleteResource: deleteCatalogEntry,
  });

  // Get reptiles for selection
  const { data: reptiles = [], isLoading: reptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  const isLoading = catalogEntriesLoading || reptilesLoading;

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    );
  }

  const onDialogChange = () => {
    setIsDialogOpen(false);
    setSelectedCatalogEntry(undefined);
  };

  // Count featured reptiles
  const featuredCount = catalogEntries.filter(entry => entry.featured).length;

  // Filter out reptiles that are already in the catalog
  const availableReptiles = reptiles.filter(reptile => 
    !catalogEntries.some(entry => entry.reptile_id === reptile.id)
  );

  return (
    <div className="space-y-6">
      <div className="grid ">
          <CatalogEntryList
            catalogEntries={catalogEntries}
            reptiles={reptiles}
            onEdit={(entry) => {
              setSelectedCatalogEntry(entry);
              setIsDialogOpen(true);
            }}
            onDelete={handleDelete}
            onAddNew={() => setIsDialogOpen(true)}
            onFeatureToggle={async (entry) => {
              // If trying to feature and already at limit of 6
              if (!entry.featured && featuredCount >= 6) {
                alert('You can only feature up to 6 reptiles.');
                return;
              }
              await handleUpdate({
                ...entry,
                featured: !entry.featured,
              });
            }}
          />

      </div>

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
          <DialogTitle>
            {selectedCatalogEntry ? 'Edit Catalog Entry' : 'Add New Catalog Entry'}
          </DialogTitle>
          <CatalogEntryForm
            initialData={selectedCatalogEntry}
            availableReptiles={selectedCatalogEntry ? reptiles : availableReptiles}
            onSubmit={async (data) => {
              const success = selectedCatalogEntry
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                onDialogChange();
              }
            }}
            onCancel={onDialogChange}
            featuredLimit={featuredCount >= 6 && !selectedCatalogEntry?.featured}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 