'use client';

import { getCatalogEntriesByorgName } from '@/app/api/catalog';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import { calculateAgeInMonths } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info, Clock } from 'lucide-react';
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
import CatalogSkeleton from '../dashboard/catalog/components/CatalogSkeleton';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

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
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [CACHE_KEYS.CATALOG_ENTRIES, orgName],
    queryFn: async () => {
      try {
        return await getCatalogEntriesByorgName(orgName);
      } catch (err) {
        // Type guard for error
        if (
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          (err as { status?: number }).status === 429
        ) {
          const rateLimitError = new Error('Too many requests. Please wait 30 seconds and try again.');
          (rateLimitError as Error & { isRateLimit?: boolean }).isRateLimit = true;
          throw rateLimitError;
        }
        if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof (err as { message?: string }).message === 'string' &&
          (err as { message: string }).message.toLowerCase().includes('too many requests')
        ) {
          const rateLimitError = new Error('Too many requests. Please wait 30 seconds and try again.');
          (rateLimitError as Error & { isRateLimit?: boolean }).isRateLimit = true;
          throw rateLimitError;
        }
        throw err;
      }
    },
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
    return <CatalogSkeleton />;
  }

  if (isError && (error as Error & { isRateLimit?: boolean })?.isRateLimit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-yellow-300 dark:border-yellow-600 rounded-xl shadow-xl p-8 flex flex-col items-center max-w-md w-full animate-fade-in">
          <Clock className="h-12 w-12 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-extrabold mb-2 text-center text-yellow-700 dark:text-yellow-400 drop-shadow">Whoa, slow down!</h1>
          <p className="text-muted-foreground text-center mb-6 text-base">
            You&apos;ve reached the viewing limit for this page.<br />
            Please wait a bit before trying again.<br />
            This helps us keep the site fast and fair for everyone.<br />
            <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 block">If you believe this is a mistake, please contact support.</span>
          </p>
          <Button onClick={() => refetch()} className="w-full font-semibold bg-yellow-500 hover:bg-yellow-600 text-white">
            Try Again
          </Button>
        </div>
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
          <AlertDescription className='text-foreground/90 inline text-[0.8rem] sm:text-sm'>
             Please report illegal or suspicious listings through our 
            <Link target='_blank' href="https://clutchly.vercel.app/contact" className='underline underline-offset-4 ml-1'>Contact Page</Link>.
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


