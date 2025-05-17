'use client';

import { createCatalogEntry, deleteCatalogEntry, getCatalogEntries, getCatalogImages, updateCatalogEntry } from '@/app/api/catalog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { CatalogEntry, CatalogImage, NewCatalogEntry } from '@/lib/types/catalog';
import { Reptile } from '@/lib/types/reptile';
import { useState, useEffect, useMemo } from 'react';
import { CatalogEntryForm } from './CatalogEntryForm';
import { CatalogEntryList } from './CatalogEntryList'
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Loader2, ArrowLeft } from 'lucide-react';
import { CatalogEntryDetails } from './CatalogEntryDetails';
import { Button } from '@/components/ui/button';
import { CatalogFilterDialog, CatalogFilters } from './CatalogFilterDialog';
import { calculateAgeInMonths } from '@/lib/utils';

export function CatalogTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entriesWithImages, setEntriesWithImages] = useState<(CatalogEntry & { images?: CatalogImage[] })[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [detailView, setDetailView] = useState<CatalogEntry | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
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

  // Get reptiles for selection
  const { data: reptiles = [], isLoading: reptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Load images for each catalog entry
  useEffect(() => {
    const loadImages = async () => {
      if (catalogEntries.length === 0) return;
      
      setImagesLoading(true);
      try {
        const entriesWithImagesData = await Promise.all(
          catalogEntries.map(async (entry) => {
            try {
              const images = await getCatalogImages(entry.id);
              return { ...entry, images };
            } catch (error) {
              console.error(`Error loading images for entry ${entry.id}:`, error);
              return { ...entry, images: [] };
            }
          })
        );
        
        setEntriesWithImages(entriesWithImagesData);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setImagesLoading(false);
      }
    };

    loadImages();
  }, [catalogEntries]);

  // Apply filters and sorting to catalog entries
  const filteredEntries = useMemo(() => {
    if (entriesWithImages.length === 0) return [];

    return entriesWithImages.filter(entry => {
      const reptile = reptiles.find(r => r.id === entry.reptile_id);
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
      const reptileA = reptiles.find(r => r.id === a.reptile_id);
      const reptileB = reptiles.find(r => r.id === b.reptile_id);
      
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
  }, [entriesWithImages, filters, reptiles]);

  const isLoading = catalogEntriesLoading || reptilesLoading || imagesLoading;

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

  const handleEntryDelete = async (id: string) => {
    try {
      await handleDelete(id);
      // Update the local state to remove the deleted entry
      setEntriesWithImages(prev => prev.filter(entry => entry.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting catalog entry:', error);
      return false;
    }
  };

  // Function to find reptile by ID
  const findReptile = (reptileId: string) => reptiles.find((r) => r.id === reptileId);
  
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

  return (
    <div className="space-y-6">
      {detailView && reptileForDetail ? (
        <div className="space-y-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => setDetailView(null)}
            >
              <ArrowLeft className="h-4 w-4 " />
              Back to Catalog
            </Button>
          </div>
          
          <CatalogEntryDetails 
            catalogEntry={detailView} 
            reptileName={reptileForDetail.name} 
            isAdmin={true}
          />
        </div>
      ) : (
        <div className="grid">
          <CatalogEntryList
            catalogEntries={filteredEntries}
            reptiles={reptiles}
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
                
                // Update the local state
                setEntriesWithImages(prev => 
                  prev.map(e => e.id === entry.id ? {...e, featured: !entry.featured} : e)
                );
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

      {/* Filter Dialog */}
      <CatalogFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </div>
  );
} 