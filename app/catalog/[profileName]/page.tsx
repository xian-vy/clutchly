'use client';

import { getCatalogEntriesByProfileName } from '@/app/api/catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CatalogEntry } from '@/lib/types/catalog';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Link as LinkIcon, Clipboard } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PublicCatalogPageProps {
  params: {
    profileName: string;
  };
}

export default function PublicCatalogPage({ params }: PublicCatalogPageProps) {
  const { profileName } = params;

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
          The catalog you're looking for doesn't exist or is no longer available.
        </p>
      </div>
    );
  }

  const catalogEntries = data as CatalogEntry[];
  const featuredEntries = catalogEntries.filter(entry => entry.featured);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">{profileName}'s Reptile Collection</h1>
          <div className="flex items-center space-x-2">
            <p className="text-muted-foreground">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              https://clutcly.vercel.app/catalog/{profileName}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(`https://clutcly.vercel.app/catalog/${profileName}`);
                toast.success('URL copied to clipboard');
              }}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
          <p className="max-w-2xl text-muted-foreground">
            A curated collection of reptiles. Browse morphs, species, and photos.
          </p>
        </div>

        {featuredEntries.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Reptiles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredEntries.map((entry) => (
                <ReptileCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Reptiles</h2>
            <p className="text-muted-foreground">{catalogEntries.length} reptiles</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalogEntries.map((entry) => (
              <ReptileCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

interface ReptileCardProps {
  entry: CatalogEntry & {
    reptiles: any;
    catalog_images: any[];
  };
}

function ReptileCard({ entry }: ReptileCardProps) {
  const reptile = entry.reptiles;

  return (
    <Card className={cn("overflow-hidden", entry.featured && "border-primary")}>
      <div className="aspect-square relative bg-muted">
        {entry.catalog_images && entry.catalog_images[0] ? (
          <Image
            src={entry.catalog_images[0].image_url}
            alt={reptile.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No image available
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">{reptile.name}</h3>
          {entry.featured && (
            <Badge variant="outline" className="bg-primary/20">
              Featured
            </Badge>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Species:</span> {reptile.species_id}
          </div>
          <div>
            <span className="text-muted-foreground">Morph:</span> {reptile.morph_id}
          </div>
          <div>
            <span className="text-muted-foreground">Sex:</span> {reptile.sex}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 