'use client';

import { getCatalogEntriesByProfileName } from '@/app/api/catalog';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clipboard, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CatalogEntryList } from '../dashboard/catalog/CatalogEntryList';
import { CatalogEntryDetails } from '../dashboard/catalog/CatalogEntryDetails';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { CatalogFilterDialog, CatalogFilters } from '../dashboard/catalog/CatalogFilterDialog';
import { calculateAgeInMonths } from '@/lib/utils';
import { APP_URL } from '@/lib/constants/app';
import { toast } from 'sonner';
interface CatalogClientPageProps {
  profileName: string;
}

export function CatalogPublicPage({ profileName }: CatalogClientPageProps) {
  const [detailView, setDetailView] = useState<EnrichedCatalogEntry | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>({
    species: [],
    morphs: [],
    sex: [],
    featured: null,
    ageInMonths: [0, 80],
    sortBy: 'newest',
  });
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', profileName],
    queryFn: () => getCatalogEntriesByProfileName(profileName),
  });



  const enrichedCatalog = isLoading ? []  : data as EnrichedCatalogEntry[];
  const reptiles = enrichedCatalog.map((entry) => entry.reptiles);
  const findReptile = (reptileId: string) => reptiles.find((r) => r.id === reptileId);
  
  const reptileForDetail = detailView ? findReptile(detailView.reptile_id) : null;

  // Apply filters and sorting to catalog entries
  const filteredEntries = useMemo(() => {
    if (enrichedCatalog.length === 0) return [];

    return enrichedCatalog.filter(entry => {
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
  }, [enrichedCatalog, filters, reptiles]);

  const activeFilterCount = [
    filters.species?.length || 0,
    filters.morphs?.length || 0,
    filters.sex?.length || 0,
    filters.featured !== null ? 1 : 0,
    filters.ageInMonths && 
      (filters.ageInMonths[0] > 0 || filters.ageInMonths[1] < 80) ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const handleApplyFilters = (newFilters: CatalogFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Catalog Not Found</h1>
        <p className="text-muted-foreground text-center">
          The catalog you&apos;re looking for doesn&apos;t exist or is no longer available.
        </p>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-background  space-y-3 lg:space-y-5">

      <div className="relative overflow-hidden bg-muted/30 border-b">
              <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
                <h1 className="text-4xl font-bold tracking-tight capitalize">{profileName}&apos;s Collection</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                  A curated showcase of exceptional reptiles and morphs
                </p>
                <div className="flex items-center mt-6 text-sm">
                  <span className="text-muted-foreground">{APP_URL}/catalog/{profileName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      navigator.clipboard.writeText(`${APP_URL}/catalog/${profileName}`);
                      toast.success('URL copied to clipboard');
                    }}
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

     <div className="container mx-auto">
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
                isAdmin={false}
              />
            </div>
          ) : (
            <div className="grid">
              <CatalogEntryList
                catalogEntries={filteredEntries}
                reptiles={reptiles}
                onViewDetails={(entry) => setDetailView(entry)}
                isAdmin={false}
                onFilter={() => setIsFilterDialogOpen(true)}
                activeFilterCount={activeFilterCount}          />
            </div>
          )}
            <CatalogFilterDialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
        />
        </div>
    </main>
  );
}
