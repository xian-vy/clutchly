'use client';

import {
  ArrowUpDown,
  EyeIcon,
  HeartIcon,
  MoreHorizontal,
  PencilIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { useSpeciesStore } from '@/lib/stores/speciesStore';

interface CatalogEntryListProps {
  catalogEntries: EnrichedCatalogEntry[] | (CatalogEntry & { images?: CatalogImage[] })[];
  reptiles: Reptile[];
  onEdit: (entry: CatalogEntry) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onFeatureToggle: (entry: CatalogEntry) => void;
  onViewDetails: (entry: CatalogEntry) => void;
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
  isAdmin = true,
}: CatalogEntryListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const {morphs} = useMorphsStore()
  const {species} = useSpeciesStore()
  
  // Function to find reptile by ID
  const findReptile = (id: string) => reptiles.find((r) => r.id === id);

  // Get the first image for a catalog entry
  const getEntryImage = (entry: CatalogEntry & { images?: CatalogImage[] }) => {
    if ('images' in entry && entry.images && entry.images.length > 0) {
      return entry.images[0].image_url;
    }
    return null;
  };

  // Get display name for species
  const getSpeciesName = (speciesId: string | number) => {
    const id = String(speciesId);
    const speciesEntry = species.find((s) => s.id.toString() === id.toString());
    return speciesEntry;
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
          <h2 className="text-2xl font-bold tracking-tight">Catalog</h2>
          <p className="text-sm text-muted-foreground">
            {catalogEntries.length} reptile{catalogEntries.length !== 1 ? 's' : ''} in your catalog
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </Button>
          )}
          
          {isAdmin && (
            <Button onClick={onAddNew} size="sm" className="h-8">
              <PlusIcon className="mr-2 h-3.5 w-3.5" />
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
            Add your first reptile to your public catalog to showcase your collection.
          </p>
          <Button onClick={onAddNew} variant="outline">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Your First Reptile
          </Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4' 
            : 'space-y-2'
        )}>
          {catalogEntries.map((entry) => {
            const reptile = findReptile(entry.reptile_id);
            if (!reptile) return null;

            const imageUrl = getEntryImage(entry);
            const species = getSpeciesName(reptile.species_id);
            const morph = getMorphName(reptile.morph_id);

            return viewMode === 'grid' ? (
              <Card 
                key={entry.id} 
                className={cn(
                  "overflow-hidden group transition-all pt-0",
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
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <span className="text-muted-foreground text-sm">No image</span>
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
                    <Badge variant="secondary" className="capitalize">
                      {reptile.sex}
                    </Badge>
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
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{reptile.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {morph?.name}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-sm">{species?.name}</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  {isAdmin ? (
                    <div className="flex w-full justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-0 hover:bg-transparent hover:text-primary"
                        onClick={() => onEdit(entry)}
                      >
                        <PencilIcon className="h-3.5 w-3.5 mr-1" />
                        Edit details
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => onViewDetails(entry)}
                      >
                        <EyeIcon className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onViewDetails(entry)}
                    >
                      <EyeIcon className="h-3.5 w-3.5 mr-1" />
                      View details
                    </Button>
                  )}
                </CardFooter>
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
                        <span className="text-muted-foreground text-xs">No image</span>
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
                    <p className="text-sm">Species: {species?.name}</p>
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