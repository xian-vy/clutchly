'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link as LinkIcon, Clipboard, ChevronDown, ChevronUp, Search, FilterIcon, Loader2} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { APP_URL } from '@/lib/constants/app';
import { useQuery } from '@tanstack/react-query';
import { getCatalogEntriesByProfileName } from '@/app/api/catalog';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import ReptileCard from './ReptileCard';



interface CatalogClientPageProps {
  profileName: string;
}

export function CatalogPublicPage({ profileName }: CatalogClientPageProps) {
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', profileName],
    queryFn: () => getCatalogEntriesByProfileName(profileName),
  });

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

  const catalogEntries = data as EnrichedCatalogEntry[];
  const featuredEntries = catalogEntries.filter(entry => entry.featured);

  const displayedFeaturedEntries = showAllFeatured 
    ? featuredEntries 
    : featuredEntries.slice(0, 3);

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight">{profileName}&apos;s Collection</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A curated showcase of exceptional reptiles and morphs
          </p>
          <div className="flex items-center mt-6 text-sm">
            <LinkIcon className="h-4 w-4 mr-1 text-muted-foreground" />
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

      <div className="container mx-auto py-12 px-4 space-y-12">
        {featuredEntries.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured Reptiles</h2>
                <p className="text-muted-foreground">Exceptional specimens from this collection</p>
              </div>
              {featuredEntries.length > 3 && (
                <Button 
                  variant="ghost" 
                  className="self-start md:self-auto" 
                  onClick={() => setShowAllFeatured(!showAllFeatured)}
                >
                  {showAllFeatured ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show All {featuredEntries.length}
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedFeaturedEntries.map((entry) => (
                <ReptileCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        <Separator className="my-8" />

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">All Reptiles</h2>
              <p className="text-muted-foreground">
                {catalogEntries.length} {catalogEntries.length === 1 ? 'reptile' : 'reptiles'} in this collection
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1" disabled>
                <FilterIcon className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1" disabled>
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {catalogEntries.map((entry) => (
              <ReptileCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
