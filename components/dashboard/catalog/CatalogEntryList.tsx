'use client';

import {
  ArrowUpDown,
  CircleHelp,
  EyeIcon,
  HeartIcon,
  Mars,
  MoreHorizontal,
  PencilIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
  Venus,
  FilterIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CatalogEntry, CatalogImage, EnrichedCatalogEntry } from '@/lib/types/catalog';
import { Reptile } from '@/lib/types/reptile';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useMorphsStore } from '@/lib/stores/morphsStore';

function extractLastTwoDigitsOfYear(dateString : string | null): string {
  if (!dateString) {
    return "--";
  }
  try {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    return year;
  } catch (error : unknown) {
    console.error("Invalid date format:", error);
    return "--";
  }
}

interface CatalogEntryListProps {
  catalogEntries: EnrichedCatalogEntry[] | (CatalogEntry & { images?: CatalogImage[] })[];
  reptiles: Reptile[];
  onEdit: (entry: CatalogEntry) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onFeatureToggle: (entry: CatalogEntry) => void;
  onViewDetails: (entry: CatalogEntry) => void;
  onFilter?: () => void;
  activeFilterCount?: number;
  isAdmin?: boolean;
}

type ViewMode = 'grid' | 'list';

export function CatalogEntryList({
  catalogEntries,
  reptiles,
  onEdit,
  onDelete,
  onAddNew,
  onFeatureToggle,
  onViewDetails,
  onFilter,
  activeFilterCount = 0,
  isAdmin = true,
}: CatalogEntryListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const {morphs} = useMorphsStore()
  
  // Function to find reptile by ID
  const findReptile = (id: string) => reptiles.find((r) => r.id === id);

  // Get the first image for a catalog entry
  const getEntryImage = (entry: CatalogEntry & { images?: CatalogImage[] }) => {
    if ('images' in entry && entry.images && entry.images.length > 0) {
      return entry.images[0].image_url;
    }
    return null;
  };

 
  // Get display name for morph
  const getMorphName = (morphId: string | number) => {
    const id = String(morphId);
    const morphEntry = morphs.find((m) => m.id.toString() === id.toString());
    return morphEntry;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg xl:text-lg font-bold tracking-tight">Featured</h2>
          <p className="text-sm text-muted-foreground">
            {catalogEntries.length} reptile{catalogEntries.length !== 1 ? 's' : ''} in your catalog
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && onFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1" 
              onClick={onFilter}
            >
              <FilterIcon className="h-3.5 w-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
          
          {isAdmin && (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </Button>
          )}
          
          {isAdmin && (
            <Button onClick={onAddNew} size="sm" className="h-8">
              <PlusIcon className="h-3.5 w-3.5" />
              Add Reptile
            </Button>
          )}
        </div>
      </div>

      {catalogEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <HeartIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No reptiles in catalog</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
            {activeFilterCount > 0 
              ? "No reptiles match your current filters. Try adjusting your filter criteria."
              : "Add your first reptile to your public catalog to showcase your collection."}
          </p>
          {activeFilterCount > 0 ? (
            <Button onClick={onFilter} variant="outline">
              <FilterIcon className="mr-2 h-4 w-4" />
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
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3  lg:grid-cols-4 2xl:grid-cols-5 3xl:!grid-cols-6 gap-2 sm:gap-3 lg:gap-4' 
            : 'space-y-2'
        )}>
          {catalogEntries.map((entry) => {
            const reptile = findReptile(entry.reptile_id);
            if (!reptile) return null;

            const imageUrl = getEntryImage(entry);
            // const species = getSpeciesName(reptile.species_id);
            const morph = getMorphName(reptile.morph_id);

            return viewMode === 'grid' ? (
              <Card 
                onClick={() => onViewDetails(entry)}
                key={entry.id} 
                className={cn(
                  "overflow-hidden group transition-all pt-0 pb-2  gap-0 cursor-pointer",
                  entry.featured ? "" : "",
                  isAdmin ? "hover:shadow-md" : ""
                )}
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden bg-muted">
                    {imageUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imageUrl}
                          alt={reptile.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-115 duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <span className="text-muted-foreground text-sm">Click View to Add Image</span>
                      </div>
                    )}
                  </div>

                  {/* Badges overlays */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {/* {entry.featured && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    )} */}
                    {/* <Badge variant="secondary" className="capitalize">
                      {reptile.sex}
                    </Badge> */}
                  </div>

                  {/* Action buttons overlay for admin */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onFeatureToggle(entry)}>
                            <StarIcon className={cn("h-4 w-4 mr-2", entry.featured && "text-amber-500")} />
                            {entry.featured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(entry)}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(entry.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2Icon className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-1">
                     <h3 className="text-xs md:text-[0.9rem] 3xl:text-base font-medium min-h-[30px] sm:min-h-[40px] tracking-wide">{reptile.name}</h3>       
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {morph?.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div>
                          {reptile.sex === 'male' ? (
                                <Mars className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                              ) : reptile.sex === 'female' ? (
                                <Venus className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                              ) : (
                                <CircleHelp className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {extractLastTwoDigitsOfYear(reptile.hatch_date)}
                       </p>
                    </div>
                  </div>
                </CardContent>
                
              </Card>
            ) : (
              <Card key={entry.id} className="overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted relative flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={reptile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <span className="text-muted-foreground text-[0.5rem] sm:text-[0.6rem] text-center">Click View to Add Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{reptile.name}</h3>
                      {entry.featured && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{morph?.name}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={entry.featured}
                      onCheckedChange={() => onFeatureToggle(entry)}
                      aria-label="Toggle feature"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(entry)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(entry)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(entry.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 