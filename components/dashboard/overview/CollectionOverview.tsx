'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BreedingProject } from "@/lib/types/breeding";
import { HealthLogEntry } from "@/lib/types/health";
import { Morph } from "@/lib/types/morph";
import { Reptile } from "@/lib/types/reptile";
import { Species } from "@/lib/types/species";
import Link from "next/link";

interface CollectionOverviewProps {
  reptiles: Reptile[];
  healthLogs: HealthLogEntry[];
  breedingProjects: BreedingProject[];
  species: Species[];
  morphs: (Morph & { species: { name: string } })[];
}

export function CollectionOverview({ 
  reptiles, 
  healthLogs, 
  breedingProjects, 
  species, 
  morphs 
}: CollectionOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Collection Overview</CardTitle>
        <CardDescription>Quick insights about your reptile collection</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="species">
          <ScrollArea className="w-full -mx-1 px-1">
            <TabsList className="mb-4 w-full flex justify-start max-w-[310px] sm:max-w-full overflow-x-auto">
              <TabsTrigger value="species">Species</TabsTrigger>
              <TabsTrigger value="morphs">Morphs</TabsTrigger>
              <TabsTrigger value="breeding">Breeding</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
            </TabsList>
          </ScrollArea>
          
          <TabsContent value="species" className="space-y-4">
            <div className="grid gap-2">
              {Object.entries(
                reptiles.reduce((acc, reptile) => {
                  acc[reptile.species_id] = (acc[reptile.species_id] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([speciesId, count], i) => {
                const speciesInfo = species.find(s => s.id.toString() === speciesId);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="overflow-hidden">
                      <span className="text-sm truncate block">
                        {speciesInfo?.name || 'Unknown species'} 
                      </span>
                      {speciesInfo?.scientific_name && 
                        <span className="text-xs text-muted-foreground italic truncate block">
                          ({speciesInfo.scientific_name})
                        </span>
                      }
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 ml-2">{count} specimens</Badge>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="morphs" className="space-y-4">
            <div className="grid gap-2">
              {Object.entries(
                reptiles.reduce((acc, reptile) => {
                  if (reptile.morph_id) {
                    acc[reptile.morph_id] = (acc[reptile.morph_id] || 0) + 1;
                  }
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
                .slice(0, 10) // Show top 10 morphs
                .map(([morphId, count], i) => {
                  const morphInfo = morphs.find(m => m.id.toString() === morphId);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="overflow-hidden">
                        <span className="text-sm truncate block">
                          {morphInfo?.name || 'Unknown morph'} 
                        </span>
                        {morphInfo?.species && 
                          <span className="text-xs text-muted-foreground truncate block">
                            ({morphInfo.species.name})
                          </span>
                        }
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 ml-2">{count} specimens</Badge>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
          
          <TabsContent value="breeding" className="space-y-4">
            <div className="grid gap-2">
              {breedingProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active breeding projects</p>
              ) : (
                breedingProjects
                  .filter(p => p.status === 'active')
                  .map((project, i) => {
                    const female = reptiles.find(r => r.id === project.female_id);
                    const male = reptiles.find(r => r.id === project.male_id);
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm truncate">
                          {male?.name || 'Unknown'} × {female?.name || 'Unknown'}
                        </span>
                        <Badge className="flex-shrink-0 ml-2">{project.status}</Badge>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            <div className="grid gap-2">
              {healthLogs
                .filter(h => !h.resolved)
                .map((health, i) => {
                  const reptile = reptiles.find(r => r.id === health.reptile_id);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm truncate">
                        {reptile?.name || 'Unknown reptile'}
                      </span>
                      <Badge variant={health.severity === 'high' ? 'destructive' : 'outline'} className="flex-shrink-0 ml-2">
                        {health.severity || 'unknown'} severity
                      </Badge>
                    </div>
                  );
                })}
              {healthLogs.filter(h => !h.resolved).length === 0 && (
                <p className="text-sm text-muted-foreground">No unresolved health issues</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/reptiles">Manage Collection</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 