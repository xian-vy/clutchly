'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dna, Users, Star } from "lucide-react";
import { Reptile } from "@/lib/types/reptile";
import { EnrichedReptile } from "../ReptileList";
import { ReptileTabProps } from "./types";

interface GeneticsTabProps extends ReptileTabProps {
  reptile: EnrichedReptile;
  reptiles: Reptile[];
}

export function GeneticsTab({ reptile, reptiles }: GeneticsTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Genetic Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reptile.visual_traits && reptile.visual_traits.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Visual Traits</p>
              <div className="flex flex-wrap gap-2">
                {(reptile.visual_traits || []).map((trait: string) => (
                  <Badge key={trait} variant="outline">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {reptile.het_traits && reptile.het_traits.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Het Traits</p>
              <div className="flex flex-wrap gap-2">
                {(reptile.het_traits || []).map((trait: {trait: string; percentage: number}) => (
                  <Badge 
                    key={trait.trait} 
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {trait.trait}
                    <span className="text-xs">({trait.percentage}%)</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Dam</p>
              {reptile.dam_id ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{reptiles.find((r)=> r.id === reptile.dam_id)?.name || "Unknown"}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Sire</p>
              {reptile.sire_id ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{reptiles.find((r)=> r.id === reptile.sire_id)?.name || "Unknown"}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>

          {reptile.generation && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Generation</p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>F{reptile.generation}</span>
              </div>
            </div>
          )}

          {reptile.breeding_line && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Breeding Line</p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>{reptile.breeding_line}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 