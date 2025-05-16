'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogEntry } from '@/lib/types/catalog';
import { Reptile } from '@/lib/types/reptile';
import { PencilIcon, PlusIcon, StarIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CatalogEntryListProps {
  catalogEntries: CatalogEntry[];
  reptiles: Reptile[];
  onEdit: (entry: CatalogEntry) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onFeatureToggle: (entry: CatalogEntry) => void;
}

export function CatalogEntryList({
  catalogEntries,
  reptiles,
  onEdit,
  onDelete,
  onAddNew,
  onFeatureToggle,
}: CatalogEntryListProps) {

  // Function to find reptile by ID
  const findReptile = (id: string) => reptiles.find(r => r.id === id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catalog Entries</h2>
          <p className="text-sm text-muted-foreground">
            Manage reptiles in your public catalog.
          </p>
        </div>
        <Button onClick={onAddNew} className="ml-auto">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Reptile
        </Button>
      </div>

      {catalogEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="mb-2 text-center text-sm text-muted-foreground">
              No reptiles in your catalog yet. Add some to get started.
            </p>
            <Button onClick={onAddNew} variant="outline" className="mt-2">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Reptile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalogEntries.map((entry) => {
            const reptile = findReptile(entry.reptile_id);
            if (!reptile) return null;

            return (
              <Card key={entry.id} className={cn(
                "overflow-hidden", 
                entry.featured && "border-primary"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{reptile.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFeatureToggle(entry)}
                      className={entry.featured ? "text-amber-500" : "text-muted-foreground"}
                    >
                      <StarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {entry.featured && <Badge variant="outline" className="bg-primary/20">Featured</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Species:</span>
                      <span>{reptile.species_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Morph:</span>
                      <span>{reptile.morph_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sex:</span>
                      <span>{reptile.sex}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entry)}
                  >
                    <PencilIcon className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    className="text-destructive"
                  >
                    <Trash2Icon className="mr-2 h-3 w-3" />
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 