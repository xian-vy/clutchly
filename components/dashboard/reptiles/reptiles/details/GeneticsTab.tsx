'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, Star, Venus, Mars, Info } from "lucide-react";
import { Reptile } from "@/lib/types/reptile";
import { EnrichedReptile } from "../ReptileList";
import { useMorphsStore } from "@/lib/stores/morphsStore";
import { Morph } from "@/lib/types/morph";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";

interface GeneticsTabProps  {
  reptile: EnrichedReptile;
  reptiles: Reptile[];
  reptileDetails: DetailedReptile | null
}

export function GeneticsTab({ reptile, reptiles }: GeneticsTabProps) {
  const { morphs } = useMorphsStore()
  const sireData = reptiles.find((r) => r.id === reptile.sire_id)
  const damData = reptiles.find((r) => r.id === reptile.dam_id)
  const sireMorph = morphs.find((m) => m.id.toString() === sireData?.morph_id.toString())
  const damMorph = morphs.find((m) => m.id.toString() === damData?.morph_id.toString()) 

  // Helper function to render trait badges
  const renderTraitBadges = (traits: string[] | undefined) => {
    if (!traits || traits.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {traits.map((trait: string) => (
          <Badge 
            key={trait} 
            variant="secondary"
            className="py-1 px-2.5 text-xs font-medium"
          >
            {trait}
          </Badge>
        ))}
      </div>
    );
  };

  // Helper function to render het trait badges
  const renderHetTraitBadges = (traits: {trait: string; percentage: number}[] | undefined) => {
    if (!traits || traits.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {traits.map((trait) => (
          <TooltipProvider key={trait.trait}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary"
                  className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
                >
                  {trait.trait}
                  <span className="text-xs opacity-90 font-semibold">{trait.percentage}%</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Possible het trait ({trait.percentage}% probability)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  // Helper function to render parent information
  const renderParentInfo = (
    parentData: Reptile | undefined, 
    parentMorph: Morph & { species: { name: string } } | undefined, 
    parentType: 'dam' | 'sire',
    parentId: string | undefined
  ) => {
    const icon = parentType === 'dam' 
      ? <Venus className="h-4 w-4 text-rose-500" /> 
      : <Mars className="h-4 w-4 text-blue-500" />;
    
    const label = parentType === 'dam' ? 'Dam' : 'Sire';
    const iconBgClass = parentType === 'dam' 
      ? 'bg-rose-50 dark:bg-rose-950/30' 
      : 'bg-blue-50 dark:bg-blue-950/30';
    
    return (
      <div className="h-full">
        <div className="bg-card border rounded-lg p-4 h-full transition-all duration-200 hover:shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className={`${iconBgClass} p-1.5 rounded-full`}>
              {icon}
            </div>
            <p className="text-sm font-medium">{label}</p>
          </div>
          
          {parentId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">{parentData?.name || "Unknown"}</span>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Morph</p>
                {parentMorph && (
                  <div>
                    <Badge 
                      variant="secondary"
                      className="py-1 px-2.5 text-xs font-medium"
                    >
                      {parentMorph.name}
                    </Badge>
                  </div>
                )}
              </div>
              
              {parentData?.visual_traits && parentData.visual_traits.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Visual Traits</p>
                  {renderTraitBadges(parentData.visual_traits)}
                </div>
              )}
              
              {parentData?.het_traits && parentData.het_traits.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Het Traits</p>
                  {renderHetTraitBadges(parentData.het_traits)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm italic">Not specified</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <Card className=" shadow-sm pt-3 px-0 gap-3 border-0">
        <CardHeader className="px-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Dna className="h-4 w-4" />
            Genetic Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3  px-0">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-3">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold">Morph</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="secondary"
                    className="py-1 px-2.5 text-xs font-medium"
                  >
                    {reptile.morph_name}
                  </Badge>
                </div>
              </div>

              {(reptile.visual_traits && reptile.visual_traits.length > 0) && (
                <div className="bg-card border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold">Visual Traits</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-60">Genetic traits that are visually expressed in this reptile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {renderTraitBadges(reptile.visual_traits)}
                </div>
              )}

              {(reptile.het_traits && reptile.het_traits.length > 0) && (
                <div className="bg-card border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold">Het Traits</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-60">Hidden genetic traits that this reptile carries but doesn&apos;t visually display</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {renderHetTraitBadges(reptile.het_traits)}
                </div>
              )}

              {reptile.breeding_line && (
                <div className="bg-card border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Breeding Line</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="py-1 px-2.5 text-xs font-medium">
                      {reptile.breeding_line}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Lineage</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderParentInfo(damData, damMorph, 'dam', reptile.dam_id?.toString())}
                {renderParentInfo(sireData, sireMorph, 'sire', reptile.sire_id?.toString())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}