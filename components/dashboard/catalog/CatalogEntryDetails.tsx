'use client';

import { deleteCatalogImage } from '@/app/api/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CatalogImageUpload } from './CatalogImageUpload';
import { formatPrice } from '@/lib/utils';
import { Copy } from 'lucide-react';

interface CatalogEntryDetailsProps {
  catalogEntry: EnrichedCatalogEntry;
  reptileName: string;
  isAdmin : boolean
  onImageChange?: (catalogEntryId: string) => void;
}

export function CatalogEntryDetails({ catalogEntry, reptileName, isAdmin,onImageChange }: CatalogEntryDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const reptile = catalogEntry.reptiles;

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    scrollToTop();
  }, []);

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
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-0 lg:gap-3 xl:gap-4 2xl:gap-5 sm:mb-5 xl:mb-10 ">
      <Card className="overflow-hidden py-0 border-0 rounded-none  gap-0">
        <CardHeader id='catalog-entry-details' className='px-0 pb-0'>
          <div className="relative h-[350px] sm:h-[500px] lg:h-[600px] bg-muted rounded-none  overflow-hidden">
            {catalogEntry.catalog_images.length > 0 && catalogEntry.catalog_images[selectedImageIndex]?.image_url ? (
              <Image
                src={catalogEntry.catalog_images[selectedImageIndex].image_url}
                alt={reptileName}
                fill
                loading='lazy'
                className="object-contain object-center bg-background"
                sizes="(max-width: 768px) 70vw, (max-width: 1200px) 60vw, 50vw"
              />
            ) : (
                <div className="flex items-center justify-center h-full w-full bg-muted">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>
            
        </CardHeader>
   
        <CardContent>
        <div className={`space-y-4 ${catalogEntry.catalog_images.length > 1 ? 'mb-4 sm:mb-6' : ''}`}>

            {/* Thumbnail gallery */}
            {catalogEntry.catalog_images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-5">
                {catalogEntry.catalog_images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`
                      aspect-square relative rounded-md overflow-hidden cursor-pointer
                      ${index === selectedImageIndex ? 'ring-1 ring-primary' : ''}
                    `}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${reptileName} thumbnail ${index + 1}`}
                      fill
                      loading='lazy'
                      className="object-cover"
                      sizes="(max-width: 768px) 15vw, 5vw"
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
      <Card className='px-0 py-5 sm:p-6 lg:p-2 xl:p-3 border-0 border-t-1 rounded-none  lg:border-t-0 lg:border-l-1 gap-2 sm:gap-4'>
        <CardHeader>
          <CardTitle className='flex flex-col items-start gap-1 sm:gap-2 mt-3'>
            <h2 className="text-2xl  md:text-3xl 2xl:text-[2rem] font-bold text-foreground/80 leading-[1.1]">
               {reptileName}
            </h2>
             <span className='text-muted-foreground'>{reptile?.species_name || 'Unknown'}</span> 
            </CardTitle>
        </CardHeader>
        <CardContent >
          <div className="space-y-6">
  
            <h3 className='text-2xl md:text-3xl xl:text-[2rem] font-bold text-foreground/80'>{formatPrice(reptile?.price) || '0.00'}</h3>
            {/* Reptile info */}
            {reptile && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm xl:text-base">Morph</span>
                    <span className="text-sm xl:text-base">{reptile.morph_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm xl:text-base">Code</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm xl:text-base">{reptile.reptile_code || 'Unknown'}</span>
                        <Copy
                        onClick={() => {
                          navigator.clipboard.writeText(reptile.reptile_code || 'Unknown Code');
                          toast.success('Reptile code copied to clipboard');
                        }}
                        className=" h-4 w-4 cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm xl:text-base">Sex</span>
                    <span className='capitalize text-xs sm:text-sm'>{reptile.sex || 'Unknown'}</span>
                  </div>
                  
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm xl:text-base">Hatch Date</span>
                      <span className="text-sm xl:text-base">{reptile.hatch_date ? new Date(reptile.hatch_date).toLocaleDateString() : "--"}</span>
                    </div>
                  
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm xl:text-base">Weight</span>
                      <span className="text-sm xl:text-base">{reptile.weight} g</span>
                    </div>
                  
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm xl:text-base">Length</span>
                      <span className="text-sm xl:text-base">{reptile.length} cm</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm xl:text-base">Produced By</span>
                      <span className="text-sm xl:text-base">{reptile.original_breeder}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm xl:text-base">Breeder</span>
                      <span className="text-sm xl:text-base">{reptile.project_ids?.length || 0  > 0 ? 'Yes' : 'No'}</span>
                    </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm xl:text-base">Traits</span>
                    <div className="flex flex-wrap gap-2 lg:gap-3 items-center">
                      {reptile.het_traits?.map((trait,i) => 
                        <span key={i} className="text-xs sm:text-sm"> {trait.percentage}% het {trait.trait}</span>
                      )} 
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}