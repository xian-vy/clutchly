'use client';

import { getCatalogEntriesByorgName } from '@/app/api/catalog';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import { calculateAgeInMonths } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CatalogEntryDetails } from '../dashboard/catalog/CatalogEntryDetails';
import { CatalogEntryList } from '../dashboard/catalog/CatalogEntryList';
import { CatalogFilterDialog, CatalogFilters } from '../dashboard/catalog/components/CatalogFilterDialog';
import { Button } from '../ui/button';
import { APP_URL } from '@/lib/constants/app';

import CatalogFooter from '../dashboard/catalog/components/CatalogFooter';
import { CatalogIntro } from '../dashboard/catalog/components/CatalogIntro';
import NotSetup from '../dashboard/catalog/components/NotSetup';
import { ThemeToggleCatalog } from '../theme/ThemeToggleCatalog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';
interface CatalogClientPageProps {
  orgName: string;
}

export function CatalogPublicPage({ orgName }: CatalogClientPageProps) {
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
    queryKey: ['catalog', orgName],
    queryFn: () => getCatalogEntriesByorgName(orgName),
  });



  const enrichedCatalog  = useMemo(() => data as EnrichedCatalogEntry[], [data]) 
  const reptiles = enrichedCatalog?.map((entry) => entry.reptiles);
  const findReptile = (reptileId: string) => reptiles?.find((r) => r?.id === reptileId);
  const catalogSettings = isLoading ? null : enrichedCatalog?.[0]?.catalog_settings || null;
  const reptileForDetail = detailView ? findReptile(detailView.reptile_id) : null;
  const organization = enrichedCatalog?.[0]?.organization || null;
  
  // Apply filters and sorting to catalog entries
  const filteredEntries = useMemo(() => {
    if (!enrichedCatalog) return [];
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
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Website Not Found</h1>
        <p className="text-muted-foreground text-center">
          The catalog you&apos;re looking for doesn&apos;t exist or is no longer available.
        </p>
      </div>
    );
  }

  if (!enrichedCatalog || enrichedCatalog.length === 0) {
    return <NotSetup isAdmin={false}/>;
  }
  return (
    <main className="min-h-screen bg-background ">
        <div className="flex  justify-between items-center bg-primary w-full text-white dark:text-black min-h-[30px] px-2 sm:px-4">
          <p className='text-[0.7rem] sm:text-sm lg:text-xs font-medium tracking-wide'>
            Made with <a href={APP_URL} className='font-semibold underline underline-offset-2' target='_blank'>Clutchly</a>
          </p>
          <ThemeToggleCatalog />
        </div>
       
        <CatalogIntro
          settings={catalogSettings} 
          isLoading={isLoading} 
          isAdmin={false}
          organization = {organization}
       />


     <div className="container mx-auto xl:px-16 2xl:px-24 3xl:px-0">      
       <Alert className='mt-5 w-11/12 sm:w-full mx-auto'>
          <Info className="h-4 w-4" />
          <AlertTitle>Disclaimer</AlertTitle>
          <AlertDescription className='text-foreground/90 inline'>
              Clutchly is a free listing service for reptile keepers and breeders. We do not facilitate transactions or verify the legality of animals listed. 
              All users are responsible for complying with 
              <Link target='_blank'  href="https://www.officialgazette.gov.ph/2001/07/30/republic-act-no-9417/" className='underline underline-offset-4'> RA 9147 </Link>  and other relevant wildlife laws. Contact the seller directly for inquiries.
              If you believe a listing violates the law, please inform us through our 
              <Link target='_blank' href="https://clutchly.vercel.app/contact"  className='underline underline-offset-4 ml-1'>Contact Page</Link>
          </AlertDescription>
       </Alert>
          {detailView && reptileForDetail ? (
            <div className="space-y-0 sm:space-y-3 md:space-y-6 mt-5 px-4">
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
        <CatalogFooter      
          organization = {organization}
          settings={catalogSettings} 
          isAdmin={false}
        />

    </main>
  );
}


