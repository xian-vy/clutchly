'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, Star, Venus, Mars, Info } from "lucide-react";
import { Reptile } from "@/lib/types/reptile";
import { EnrichedReptile } from "../ReptileList";
import { ReptileTabProps } from "./types";
import { useMorphsStore } from "@/lib/stores/morphsStore";
import { Morph } from "@/lib/types/morph";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeneticsTabProps extends ReptileTabProps {
  reptile: EnrichedReptile;
  reptiles: Reptile[];
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
            variant="outline" 
            className="py-1.5 px-3 text-xs font-medium rounded-full border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors"
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
                  variant="outline"
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-full border-amber-300/40 bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 dark:border-amber-700/40 transition-colors"
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
      : <Mars className="h-4 w-4 text-sky-500" />;
    
    const label = parentType === 'dam' ? 'Dam' : 'Sire';
    const bgClass = parentType === 'dam' 
      ? 'bg-gradient-to-br from-rose-50/60 to-rose-50/20 dark:from-rose-950/30 dark:to-rose-950/10' 
      : 'bg-gradient-to-br from-sky-50/60 to-sky-50/20 dark:from-sky-950/30 dark:to-sky-950/10';
    const borderClass = parentType === 'dam' 
      ? 'border-rose-200/50 dark:border-rose-800/40' 
      : 'border-sky-200/50 dark:border-sky-800/40';
    
    return (
      <div className="h-full">
        <div className={`${bgClass} ${borderClass} p-4 rounded-xl border backdrop-blur-sm h-full transition-all duration-200 hover:shadow-md`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`${parentType === 'dam' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-sky-100 dark:bg-sky-900/40'} p-1.5 rounded-full`}>
              {icon}
            </div>
            <p className="text-sm font-medium">{label}</p>
          </div>
          
          {parentId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">{parentData?.name || "Unknown"}</span>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Morph</p>
                {parentMorph && (
                  <div>
                    <Badge 
                      variant="outline" 
                      className="py-1.5 px-3 text-xs font-medium bg-primary/10 border-primary/40 hover:bg-primary/20 transition-colors"
                    >
                      {parentMorph.name}
                    </Badge>
                  </div>
                )}
              </div>
              
              {parentData?.visual_traits && parentData.visual_traits.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Visual Traits</p>
                  {renderTraitBadges(parentData.visual_traits)}
                </div>
              )}
              
              {parentData?.het_traits && parentData.het_traits.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Het Traits</p>
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
    <div className="space-y-6 mt-4">
      <Card className="overflow-hidden border border-border/70 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 ">
            <div >
              <Dna className="h-5 w-5 " />
            </div>
            Genetic Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-background to-muted/20 p-5 rounded-xl border border-border/70 ">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                  </div>
                  <p className="text-sm font-semibold">Morph</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="default"
                    className="flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-medium bg-primary/90 hover:bg-primary transition-all"
                  >
                    {reptile.morph_name}
                  </Badge>
                </div>
              </div>

              {(reptile.visual_traits && reptile.visual_traits.length > 0) && (
                <div className="group bg-gradient-to-r from-background to-muted/20 p-5 rounded-xl border border-border/70 ">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    </div>
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
                <div className="group bg-gradient-to-r from-background to-muted/20 p-5 rounded-xl border border-border/70 ">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    </div>
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
                <div className="group bg-gradient-to-r from-background to-muted/20 p-5 rounded-xl border border-border/70 ">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <p className="text-sm font-semibold">Breeding Line</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm bg-amber-100/50 dark:bg-amber-900/30 py-1.5 px-3 rounded-lg">
                      {reptile.breeding_line}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                </div>
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