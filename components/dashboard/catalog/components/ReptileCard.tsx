import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnrichedCatalogEntry } from '@/lib/types/catalog';
import { cn, extractLastTwoDigitsOfYear, formatPrice } from '@/lib/utils';
import {
  CircleHelp,
  Mars,
  MoreHorizontal,
  PencilIcon,
  StarIcon,
  Trash2Icon,
  Venus
} from 'lucide-react';
import Image from 'next/image';

interface ReptileCardProps {
  entry: EnrichedCatalogEntry;
  viewMode?: 'grid' | 'list';
  isAdmin?: boolean;
  onFeatureToggle?: (entry: EnrichedCatalogEntry) => void;
  onEdit?: (entry: EnrichedCatalogEntry) => void;
  onDelete?: (id: string) => void;
  onClick?: (entry: EnrichedCatalogEntry) => void;
  isFeatured?: boolean;
}

export function ReptileCard({
  entry,
  viewMode = 'grid',
  isAdmin = false,
  onFeatureToggle,
  onEdit,
  onDelete,
  onClick,
  isFeatured
}: ReptileCardProps) {
  const imageUrl = entry.catalog_images ? entry.catalog_images[0]?.image_url  : null;
  const reptile = entry.reptiles;
  const morph = entry.reptiles?.morph_name;

  if (viewMode === 'grid') {
    return (
      <Card 
        onClick={() => onClick?.(entry)}
        className={cn(
          "overflow-hidden group transition-all py-0 gap-0 cursor-pointer",
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
                  alt={reptile?.name || 'Reptile'}
                  fill
                  loading='lazy'
                  className="object-cover transition-transform group-hover:scale-115 duration-300"
                  sizes={isFeatured ? "(max-width: 768px) 70vw, (max-width: 1200px) 40vw, 25vw" : "(max-width: 768px) 60vw, (max-width: 1200px) 33vw, 15vw"}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted">
                <span className="text-muted-foreground text-sm">{
                  isAdmin? "Click View to Add Image" : "No Image Available"
                  }</span>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFeatureToggle?.(entry); }}>
                    <StarIcon className={cn("h-4 w-4 mr-2", entry.featured && "text-amber-500")} />
                    {entry.featured ? 'Unfeature' : 'Feature'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(entry); }}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(entry.id); }}
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
            <h3 className="text-xs md:text-[0.9rem] 3xl:text-base font-medium min-h-[30px] sm:min-h-[40px] tracking-wide">{reptile?.name}</h3>       
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {morph}
            </p>
            <div className="flex justify-between w-full items-center">
                <p className='text-sm md:text-base 3xl:text-lg font-semibold'>{formatPrice(reptile?.price)}</p>
                <div className="flex items-center gap-1">
                    <div>
                      {reptile?.sex === 'male' ? (
                        <Mars className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      ) : reptile?.sex === 'female' ? (
                        <Venus className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      ) : (
                        <CircleHelp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {extractLastTwoDigitsOfYear(reptile?.hatch_date || '')}
                    </p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-2">
      <div className="px-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted relative flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={reptile?.name || 'Reptile'}
              fill
              loading='lazy'
              className="object-cover"
              sizes={isFeatured ? "(max-width: 768px) 70vw, (max-width: 1200px) 50vw, 33vw" : "(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 10vw"}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted">
              <span className="text-muted-foreground text-[0.5rem] sm:text-[0.6rem] text-center">Click View to Add Image</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs md:text-[0.9rem] 3xl:text-base font-medium ">{reptile?.name}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{morph}</p>
        </div>

        
        {isAdmin && (
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onFeatureToggle?.(entry)}>
                  <StarIcon className={cn("h-4 w-4 mr-2", entry.featured && "text-amber-500")} />
                  {entry.featured ? 'Unfeature' : 'Feature'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(entry)}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(entry.id)}
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
    </Card>
  );
}