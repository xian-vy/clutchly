'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CatalogImage } from '@/lib/types/catalog';
import { Loader2, UploadCloud, X, ImageIcon, ArrowUpIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { API_UPLOAD_CATALOG_IMAGE } from '@/lib/constants/api';

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
  const MAX_IMAGES = 3;
  const remainingSlots = MAX_IMAGES - existingImages.length;
  const queryClient = useQueryClient();

  const handleUpload = useCallback(async (file: File) => {
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

      const response = await fetch(API_UPLOAD_CATALOG_IMAGE, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      toast.success('Image uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['catalog-entries'] });

      onImageUploaded();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during upload';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [catalogEntryId, onImageUploaded]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (remainingSlots <= 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    [handleUpload, remainingSlots]
  );

  // Traditional file input handler as fallback for drag-drop
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    handleUpload(file);
    e.target.value = '';
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: 1,
    disabled: isUploading || remainingSlots <= 0,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reptile Images</h3>
        <p className="text-sm text-muted-foreground">
          {existingImages.length} of {MAX_IMAGES} images used
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Main upload area - only show if more slots available */}
      {remainingSlots > 0 && (
        <div
          {...getRootProps()}
          className={`
            border-2 rounded-lg p-6 flex flex-col items-center justify-center transition-all
            ${isDragActive 
              ? 'border-primary bg-primary/10 border-dashed ring-2 ring-primary/30 shadow-lg' 
              : 'border-dashed border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/50'}
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
            min-h-[200px] cursor-pointer
          `}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="font-medium">Uploading image...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              {isDragActive ? (
                <>
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <ArrowUpIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-primary mb-1">Drop to upload!</p>
                  <p className="text-sm text-muted-foreground">Release your file to start uploading</p>
                </>
              ) : (
                <>
                  <div className="bg-muted p-3 rounded-full mb-4">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-1">Drag & drop your image here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse your files</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Select file
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Accepted formats: JPEG, PNG, WebP (max 2MB)
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid of images - including existing and empty slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Existing Images */}
        {existingImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group relative h-[220px] py-0">
            <CardContent className="p-0 h-full">
              <div className="relative h-full w-full">
                <Image
                  src={image.image_url}
                  alt="Reptile"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="z-10"
                    onClick={() => onImageRemoved(image.id)}
                  >
                    <X className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty slots (if no upload is in progress) */}
        {!isUploading && remainingSlots > 0 && remainingSlots < 3 && Array.from({ length: remainingSlots }).map((_, index) => (
          <Card 
            key={`placeholder-${index}`} 
            className="h-[220px] border border-dashed border-muted-foreground/25 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={open}
          >
            <CardContent className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center justify-center text-muted-foreground/70">
                <ImageIcon className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add image</p>
                <p className="text-xs">Click to upload</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traditional file input as fallback */}
      <input 
        type="file" 
        id="file-input-fallback"
        className="hidden" 
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        disabled={isUploading || remainingSlots <= 0}
      />
    </div>
  );
} 