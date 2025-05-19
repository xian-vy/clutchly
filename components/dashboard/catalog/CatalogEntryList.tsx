'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CatalogEntry, EnrichedCatalogEntry } from '@/lib/types/catalog';
import { cn } from '@/lib/utils';
import {
  FilterIcon,
  Globe,
  PlusIcon
} from 'lucide-react';
import { ReptileCard } from './components/ReptileCard';


type ViewMode = 'grid' | 'list';

interface CatalogEntryListProps {
  catalogEntries: EnrichedCatalogEntry[] ;
  onEdit?: (entry: CatalogEntry) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  onFeatureToggle?: (entry: EnrichedCatalogEntry) => void;
  onViewDetails: (entry: EnrichedCatalogEntry) => void;
  onFilter?: () => void;
  activeFilterCount?: number;
  isAdmin?: boolean;
  viewMode? : ViewMode;
}


export function CatalogEntryList({
  catalogEntries,
  onEdit,
  onDelete,
  onAddNew,
  onFeatureToggle,
  onViewDetails,
  onFilter,
  activeFilterCount = 0,
  isAdmin = true,
  viewMode = 'grid'
}: CatalogEntryListProps) {
  
  const featuredEntries = catalogEntries.filter(entry => entry.featured);
  const displayedFeaturedEntries = featuredEntries.slice(0, 4);

  return (
    <div className="space-y-6">
  
      {catalogEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
             {activeFilterCount > 0 ? (
               <FilterIcon className="h-6 w-6 text-primary" />
             ) : (
              <Globe className="h-8 w-8 text-primary" />
             )}
          </div>
          <h3 className="text-lg font-semibold">
            {activeFilterCount > 0 
              ? "No Reptiles Match Your Filters"
              : "Setup your Free Website!"}
            </h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
            {activeFilterCount > 0 
              ? "No reptiles match your current filters. Try adjusting your filter criteria."
              : "Add your first reptile to your public catalog to showcase your collection."}
          </p>
          {activeFilterCount > 0 ? (
            <Button onClick={onFilter} variant="outline">
              <FilterIcon className="h-4 w-4" />
              Adjust Filters
            </Button>
          ) : (
            <Button onClick={onAddNew} variant="outline">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Reptile
            </Button>
          )}
        </div>
      ) : (
        <div className="">
          <div className="container mx-auto py-6 xl:py-8 px-4 space-y-6 xl:space-y-12">
            {featuredEntries.length > 0 && (
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Reptiles</h2>
                    <p className="text-muted-foreground">Exceptional specimens from this collection</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedFeaturedEntries.map((entry) => (
                    <ReptileCard
                      key={entry.id}
                      entry={entry}
                      isAdmin={isAdmin}
                      onFeatureToggle={onFeatureToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onClick={onViewDetails}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
          
          <div className="container mx-auto py-6 xl:py-8  px-4 space-y-6 ">
              <div className="flex items-center justify-between gap-4">
                  <div>
                        <h2 className="text-2xl md:text-3xl  font-bold tracking-tight">All Reptiles</h2>
                        <p className="text-muted-foreground">{catalogEntries?.length} reptiles in this collection </p>
                  </div>
                  <div className="flex items-center justify-start">
                      { onFilter && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1" 
                            onClick={onFilter}
                          >
                            <FilterIcon className="h-3.5 w-3.5" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                {activeFilterCount}
                              </Badge>
                            )}  
                          </Button>
                        )}
                  </div>
                </div>
              <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 3xl:!grid-cols-6 gap-2 sm:gap-3 lg:gap-4')}>
                {catalogEntries.map((entry) => (
                  <ReptileCard
                    key={entry.id}
                    entry={entry}
                    viewMode={viewMode}
                    isAdmin={isAdmin}
                    onFeatureToggle={onFeatureToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onViewDetails}
                  />
                ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
}