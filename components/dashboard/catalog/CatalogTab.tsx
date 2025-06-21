'use client';

import { createCatalogEntry, deleteCatalogEntry, getCatalogEntries, updateCatalogEntry } from '@/app/api/catalog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { CatalogEntry, EnrichedCatalogEntry, NewCatalogEntry } from '@/lib/types/catalog';
import { useState,  useMemo } from 'react';
import { CatalogEntryForm } from './CatalogEntryForm';
import { CatalogEntryList } from './CatalogEntryList'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { CatalogEntryDetails } from './CatalogEntryDetails';
import { Button } from '@/components/ui/button';
import { CatalogFilterDialog, CatalogFilters } from './components/CatalogFilterDialog';
import { calculateAgeInMonths } from '@/lib/utils';
import CatalogActions from './CatalogActions';
import { CatalogIntro } from './components/CatalogIntro';
import { Separator } from '@/components/ui/separator';
import CatalogFooter from './components/CatalogFooter';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';

export function CatalogTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailView, setDetailView] = useState<EnrichedCatalogEntry | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>({
    species: [],
    morphs: [],
    sex: [],
    featured: null,
    ageInMonths: [0, 80],
    sortBy: 'newest',
  });
  
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
  const queryClient = useQueryClient();
  const { data: reptiles = [] } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });
  // Convert  enriched entries, cant cast Enriched to useResource since other CRUD works with original type : CatalogEntry
  const enrichedCatalog = useMemo(() =>  catalogEntries as EnrichedCatalogEntry[],[catalogEntries])
  const catalog_settings = useMemo(() => enrichedCatalog[0]?.catalog_settings  || null ,[enrichedCatalog])
  const organization = enrichedCatalog[0]?.organization  || null

  // Apply filters and sorting to catalog entries
  const filteredEntries = useMemo(() => {
    if (enrichedCatalog.length === 0) return [];

    return enrichedCatalog.filter(entry => {
      const reptile = reptiles.find(r => r?.id === entry.reptile_id);
      if (!reptile) return false;

      // Filter by species
      if (filters.species && filters.species.length > 0) {
        if (!filters.species.includes(reptile.species_id.toString())) {
          return false;
        }
      }

      // Filter by morphs
      if (filters.morphs && filters.morphs.length > 0) {
        if (!filters.morphs.includes(reptile.morph_id.toString())) {
          return false;
        }
      }

      // Filter by sex
      if (filters.sex && filters.sex.length > 0) {
        if (!filters.sex.includes(reptile.sex)) {
          return false;
        }
      }

      // Filter by featured status
      if (filters.featured !== null) {
        if (entry.featured !== filters.featured) {
          return false;
        }
      }

      // Filter by age
      if (filters.ageInMonths && reptile.hatch_date) {
        const ageInMonths = calculateAgeInMonths(new Date(reptile.hatch_date));
        if (ageInMonths < filters.ageInMonths[0] || ageInMonths > filters.ageInMonths[1]) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Apply sorting
      const reptileA = reptiles.find(r => r?.id === a.reptile_id);
      const reptileB = reptiles.find(r => r?.id === b.reptile_id);
      
      if (!reptileA || !reptileB) return 0;

      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return reptileA.name.localeCompare(reptileB.name);
        case 'name_desc':
          return reptileB.name.localeCompare(reptileA.name);
        default:
          return 0;
      }
    });
  }, [enrichedCatalog, filters, reptiles]);

  const isLoading = catalogEntriesLoading

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
        <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    );
  }

  const onDialogChange = (open: boolean) => {
    if (isSubmitting) return;
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCatalogEntry(undefined);
    }
  };

  const onCancel = () => {
    onDialogChange(false);
  };

  // Count featured reptiles
  const featuredCount = catalogEntries.filter(entry => entry.featured).length;

  // Filter out reptiles that are already in the catalog
  const availableReptiles = reptiles.filter(reptile => 
    !catalogEntries.some(entry => entry.reptile_id === reptile?.id)
  );

  const handleEntryDelete = async (id: string) => {
    try {
      // Store settings and organization before deletion
      const currentSettings = catalog_settings;
      const currentProfile = organization;
      
      await handleDelete(id);
      
      // Update the enrichedCatalog with preserved settings
      if (enrichedCatalog.length === 1) {
        queryClient.setQueryData(['catalog-entries'], (oldData: EnrichedCatalogEntry[]) => {
          if (!oldData || !Array.isArray(oldData)) return [];
          // Return empty array but with settings preserved
          return [{
            catalog_settings: currentSettings,
            organization: currentProfile
          }];
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting catalog entry:', error);
      return false;
    }
  };

  // Function to find reptile by ID
  const findReptile = (reptileId: string) => reptiles.find((r) => r?.id === reptileId);
  
  // Find the reptile for detail view
  const reptileForDetail = detailView ? findReptile(detailView.reptile_id) : null;

  // Handle applying filters
  const handleApplyFilters = (newFilters: CatalogFilters) => {
    setFilters(newFilters);
  };

  // Count active filters
  const activeFilterCount = [
    filters.species?.length || 0,
    filters.morphs?.length || 0,
    filters.sex?.length || 0,
    filters.featured !== null ? 1 : 0,
    filters.ageInMonths && 
      (filters.ageInMonths[0] > 0 || filters.ageInMonths[1] < 80) ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const handleImageChange = async (entryId: string) => {
    // Wait for the query to be invalidated and refetched
    await queryClient.invalidateQueries({ queryKey: ['catalog-entries'] });
    
    // Get the latest data from the cache
    const latestData = queryClient.getQueryData(['catalog-entries']) as EnrichedCatalogEntry[];
    const updatedEntry = latestData?.find(entry => entry.id === entryId);
    
    if (updatedEntry) {
      // Update the detailView with the complete latest data
      setDetailView(updatedEntry);
    }
  };

  return (
    <div className="space-y-6">

      <CatalogActions 
        isAdmin={true}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Separator />


      <CatalogIntro
       settings={catalog_settings} 
       isLoading={isLoading} 
       isAdmin={true}
       organization = {organization}
       />


      {detailView && reptileForDetail ? (
        <div className="space-y-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
          
              onClick={() => setDetailView(null)}
            >
              <ArrowLeft className="h-4 w-4 " />
              Back to List
            </Button>
          </div>
          
          <CatalogEntryDetails 
            catalogEntry={detailView} 
            reptileName={reptileForDetail.name} 
            isAdmin={true}
            onImageChange={handleImageChange}
          />
        </div>
      ) : (
        <div className="grid">
          <CatalogEntryList
            catalogEntries={filteredEntries}
            onEdit={(entry) => {
              setSelectedCatalogEntry(entry);
              setIsDialogOpen(true);
            }}
            onDelete={handleEntryDelete}
            onAddNew={() => setIsDialogOpen(true)}
            onFeatureToggle={async (entry) => {
              // If trying to feature and already at limit of 6
              if (!entry.featured && featuredCount >= 6) {
                alert('You can only feature up to 6 reptiles.');
                return;
              }
              try {
                await handleUpdate({
                  ...entry,
                  featured: !entry.featured,
                });
                
          
              } catch (error) {
                console.error('Error updating catalog entry:', error);
              }
            }}
            onViewDetails={(entry) => setDetailView(entry)}
            isAdmin={true}
            onFilter={() => setIsFilterDialogOpen(true)}
            activeFilterCount={activeFilterCount}
          />
        </div>
      )}

      {/* Add/Edit Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent className="sm:max-w-[500px] ">
          <DialogTitle>
            {selectedCatalogEntry ? 'Edit Catalog Entry' : 'Add New Catalog Entry'}
          </DialogTitle>
          <CatalogEntryForm
            availableReptiles={availableReptiles}
            initialData={selectedCatalogEntry}
            onSubmit={async (data) => {
              setIsSubmitting(true);
              try {
                const success = selectedCatalogEntry
                  ? await handleUpdate(data)
                  : await handleCreate(data);
                if (success) {
                  onDialogChange(false);
                  await queryClient.invalidateQueries({ queryKey: ['catalog-entries'] });
                }
              } finally {
                setIsSubmitting(false);
              }
            }}
            onCancel={onCancel}
            featuredLimit={featuredCount >= 6 && !selectedCatalogEntry?.featured}
            loading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <CatalogFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
      <CatalogFooter 
        organization = {organization}
        settings={catalog_settings}
        isAdmin={true}
      />
    </div>
  );
}