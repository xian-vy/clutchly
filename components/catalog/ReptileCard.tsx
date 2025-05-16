import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import { extractLastTwoDigitsOfYear } from '@/lib/utils';
import { CircleHelp, EyeIcon, Mars, Venus } from 'lucide-react';
import Image from 'next/image';


interface ReptileCardProps {
    entry: EnrichedCatalogEntry;
  }
  
const ReptileCard = ({ entry }: ReptileCardProps) => {
    const reptile = entry.reptiles;
    const imageUrl = entry.catalog_images?.[0]?.image_url;
  
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md py-0 gap-0">
        <div className="relative aspect-square bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={reptile.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <EyeIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
            <h3 className="text-xs md:text-[0.9rem] 3xl:text-base font-medium min-h-[30px] sm:min-h-[40px] tracking-wide">{reptile.name}</h3>       
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {reptile.morph.name}
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
        </CardContent>
        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
          <div className="w-full truncate">
         
          </div>
        </CardFooter>
      </Card>
    );
}

export default ReptileCard