'use client';

import { deleteCatalogImage, getCatalogImages } from '@/app/api/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogEntry, CatalogImage } from '@/lib/types/catalog';
import { Loader2, InfoIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CatalogImageUpload } from './CatalogImageUpload';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { Reptile } from '@/lib/types/reptile';

interface CatalogEntryDetailsProps {
  catalogEntry: CatalogEntry;
  reptileName: string;
}

export function CatalogEntryDetails({ catalogEntry, reptileName }: CatalogEntryDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { species } = useSpeciesStore();
  const { morphs } = useMorphsStore();
  const [reptile, setReptile] = useState<Reptile | null>(null);

  const {
    data: images = [],
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useQuery<CatalogImage[]>({
    queryKey: ['catalog-images', catalogEntry.id],
    queryFn: () => getCatalogImages(catalogEntry.id),
  });

  // Fetch the reptile details
  const { isLoading: reptileLoading } = useQuery({
    queryKey: ['reptile', catalogEntry.reptile_id],
    queryFn: async () => {
      const reptileData = await getReptileById(catalogEntry.reptile_id);
      setReptile(reptileData);
      return reptileData;
    },
  });

  const reptileSpecies = reptile ? species.find((s) => String(s.id) === String(reptile.species_id)) : null;
  const reptileMorph = reptile ? morphs.find((m) => String(m.id) === String(reptile.morph_id)) : null;

  const handleImageUploaded = () => {
    refetchImages();
  };

  const handleImageRemoved = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteCatalogImage(imageId);
      toast.success('Image deleted successfully');
      refetchImages();
      if (selectedImageIndex >= images.length - 1) {
        setSelectedImageIndex(Math.max(0, images.length - 2));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(errorMessage);
    }
  };

  const isLoading = imagesLoading || reptileLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column - Images */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main image display */}
            <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImageIndex].image_url}
                  alt={reptileName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-muted">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`
                      aspect-square relative rounded-md overflow-hidden cursor-pointer
                      ${index === selectedImageIndex ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${reptileName} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 10vw"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Image upload component */}
            <CatalogImageUpload
              catalogEntryId={catalogEntry.id}
              existingImages={images}
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
            />
          </div>
        </CardContent>
      </Card>

      {/* Right column - Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{reptileName} Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Featured badge */}
            {catalogEntry.featured && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Featured in Catalog
              </Badge>
            )}
            
            {/* Reptile info */}
            {reptile && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Name</span>
                    <span>{reptile.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Species</span>
                    <span>{reptileSpecies?.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Morph</span>
                    <span>{reptileMorph?.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Sex</span>
                    <Badge variant="outline" className="capitalize">{reptile.sex}</Badge>
                  </div>
                  
                  {reptile.hatch_date && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Hatch Date</span>
                      <span>{new Date(reptile.hatch_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {reptile.weight && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Weight</span>
                      <span>{reptile.weight} g</span>
                    </div>
                  )}
                  
                  {reptile.length && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Length</span>
                      <span>{reptile.length} cm</span>
                    </div>
                  )}
                </div>
                
                {/* Reptile Notes */}
                {reptile.notes && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Notes</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reptile.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 