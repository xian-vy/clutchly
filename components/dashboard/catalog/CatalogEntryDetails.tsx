'use client';

import { deleteCatalogImage } from '@/app/api/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { CatalogImageUpload } from './CatalogImageUpload';
import { formatPrice } from '@/lib/utils';

interface CatalogEntryDetailsProps {
  catalogEntry: EnrichedCatalogEntry;
  reptileName: string;
  isAdmin : boolean
  onImageChange?: (catalogEntryId: string) => void;
}

export function CatalogEntryDetails({ catalogEntry, reptileName, isAdmin,onImageChange }: CatalogEntryDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const reptile = catalogEntry.reptiles;

  const handleImageRemoved = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteCatalogImage(imageId);
      toast.success('Image deleted successfully');
      if (selectedImageIndex >= catalogEntry.catalog_images.length - 1) {
        setSelectedImageIndex(Math.max(0, catalogEntry.catalog_images.length - 2));
      }
      onImageChange?.(catalogEntry.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(errorMessage);
    }
  };

  const handleImageUploaded = () => {
    onImageChange?.(catalogEntry.id);
  };



  // Update the JSX to use currentEntry instead of catalogEntry
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 mb-5 xl:mb-10">
      <Card className="overflow-hidden pt-0">
        <CardHeader className='px-0 pb-0'>
          <div className="relative h-[500px] bg-muted rounded-t-md overflow-hidden">
            {catalogEntry.catalog_images.length > 0 && catalogEntry.catalog_images[selectedImageIndex]?.image_url ? (
              <Image
                src={catalogEntry.catalog_images[selectedImageIndex].image_url}
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
            
        </CardHeader>
   
        <CardContent>
        <div className="space-y-4">

            {/* Thumbnail gallery */}
            {catalogEntry.catalog_images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {catalogEntry.catalog_images.map((image, index) => (
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
            {isAdmin &&
            <CatalogImageUpload
              catalogEntryId={catalogEntry.id}
              existingImages={catalogEntry.catalog_images}
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
            />
              }
          </div>
        </CardContent>
      </Card>

      {/* Right column - Details */}
      <Card className='p-3 sm:p-4 md:p-5 xl:p-6 xl:py-10'>
        <CardHeader>
          <CardTitle className='flex flex-col items-start gap-1 sm:gap-2'>
            <h2 className="text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-bold">
               {reptileName}
            </h2>
             <span className='text-muted-foreground'>{reptile?.species_name || 'Unknown'}</span> 
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
  
            <h3 className='text-2xl md:text-3xl xl:text-4xl font-bold'>{formatPrice(reptile?.price) || '0.00'}</h3>
            {/* Reptile info */}
            {reptile && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
 
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Morph</span>
                    <span>{reptile.morph_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Code</span>
                    <span>{reptile.reptile_code || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Sex</span>
                    <span className='capitalize'>{reptile.sex || 'Unknown'}</span>
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

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Traits</span>
                    <div className="flex flex-wrap gap-2 lg:gap-3 items-center">
                      {reptile.het_traits?.map((trait,i) => 
                        <span key={i} className="text-xs sm:text-sm"> {trait.percentage}% het {trait.trait}</span>
                      )} 
                    </div>
                  </div>

                </div>
                
                {/* {reptile.notes && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Notes</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reptile.notes}</p>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}