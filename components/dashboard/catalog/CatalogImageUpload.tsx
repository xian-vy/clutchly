'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CatalogImage } from '@/lib/types/catalog';
import { Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CatalogImageUploadProps {
  catalogEntryId: string;
  existingImages: CatalogImage[];
  onImageUploaded: () => void;
  onImageRemoved: (imageId: string) => void;
}

export function CatalogImageUpload({
  catalogEntryId,
  existingImages,
  onImageUploaded,
  onImageRemoved,
}: CatalogImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    e.target.value = ''; // Reset input

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Check file size
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setError('File size must not exceed 2MB');
      toast.error('File size must not exceed 2MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('catalogEntryId', catalogEntryId);

      const response = await fetch('/api/catalog/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      toast.success('Image uploaded successfully');
      onImageUploaded();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during upload';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reptile Images</h3>
        <div className="flex items-center">
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading || existingImages.length >= 3}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading || existingImages.length >= 3}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {existingImages.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-background">
          <p className="text-muted-foreground">
            No images yet. Upload up to 3 images.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {existingImages.map((image) => (
            <Card key={image.id} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt="Reptile"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onImageRemoved(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {Array(3 - existingImages.length)
            .fill(0)
            .map((_, index) => (
              <Card key={`empty-${index}`} className="border-dashed border-2 bg-muted/50">
                <CardContent className="flex items-center justify-center p-0">
                  <div className="aspect-square flex flex-col items-center justify-center w-full">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Add image
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
} 