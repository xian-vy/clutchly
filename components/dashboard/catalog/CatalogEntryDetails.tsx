'use client';

import { deleteCatalogImage, getCatalogImages } from '@/app/api/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogEntry, CatalogImage } from '@/lib/types/catalog';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CatalogImageUpload } from './CatalogImageUpload';

interface CatalogEntryDetailsProps {
  catalogEntry: CatalogEntry;
  reptileName: string;
}

export function CatalogEntryDetails({ catalogEntry, reptileName }: CatalogEntryDetailsProps) {
  const {
    data: images = [],
    isLoading,
    refetch: refetchImages,
  } = useQuery<CatalogImage[]>({
    queryKey: ['catalog-images', catalogEntry.id],
    queryFn: () => getCatalogImages(catalogEntry.id),
  });

  const handleImageUploaded = () => {
    refetchImages();
  };

  const handleImageRemoved = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteCatalogImage(imageId);
      toast.success('Image deleted successfully');
      refetchImages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(errorMessage);
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{reptileName} Images</CardTitle>
      </CardHeader>
      <CardContent>
        <CatalogImageUpload
          catalogEntryId={catalogEntry.id}
          existingImages={images}
          onImageUploaded={handleImageUploaded}
          onImageRemoved={handleImageRemoved}
        />
      </CardContent>
    </Card>
  );
} 