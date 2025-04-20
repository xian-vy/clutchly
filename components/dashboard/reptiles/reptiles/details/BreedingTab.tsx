'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Baby, Plus } from "lucide-react";
import { Reptile } from "@/lib/types/reptile";
import { format, parseISO } from "date-fns";
import { ReptileTabProps } from "./types";

interface BreedingTabProps extends ReptileTabProps {
  reptiles: Reptile[];
}

export function BreedingTab({ reptileDetails, reptiles }: BreedingTabProps) {
  if (!reptileDetails) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  const displayOffspring = (offspring: Reptile[]) => {
    if (!offspring || offspring.length === 0) {
      return <p className="text-muted-foreground">No offspring records found</p>;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Total Offspring: {offspring.length}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offspring.slice(0, 4).map((baby: Reptile) => (
            <Card key={baby.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{baby.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {reptiles.find(r => r.id === baby.species_id)?.name || "Unknown Species"}
                    </p>
                  </div>
                  <Badge>
                    {baby.sex}
                  </Badge>
                </div>
                <div className="mt-2 text-sm">
                  <p className="flex items-center gap-1">
                    Hatched: {formatDate(baby.hatch_date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {offspring.length > 4 && (
          <div className="text-center">
            <Button variant="link" size="sm">View All Offspring</Button>
          </div>
        )}
      </div>
    );
  };

  const hasBreedingProjects = 
    (reptileDetails.breeding_projects_as_sire && reptileDetails.breeding_projects_as_sire.length > 0) ||
    (reptileDetails.breeding_projects_as_dam && reptileDetails.breeding_projects_as_dam.length > 0);

  if (!hasBreedingProjects && (!reptileDetails.offspring || reptileDetails.offspring.length === 0)) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Baby className="h-5 w-5" />
              No Breeding History
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-muted-foreground">This reptile has no breeding projects or offspring records.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {hasBreedingProjects && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Breeding Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {reptileDetails && (
              <div className="space-y-6">
                {reptileDetails.breeding_projects_as_sire && reptileDetails.breeding_projects_as_sire.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">As Sire</h4>
                    <div className="space-y-2">
                      {reptileDetails.breeding_projects_as_sire.slice(0, 3).map((project: any) => (
                        <Card key={project.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{project.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(project.start_date)}
                                  {project.end_date ? ` - ${formatDate(project.end_date)}` : " - Present"}
                                </p>
                              </div>
                              <Badge
                                className={
                                  project.status === 'active' ? 'bg-green-500' :
                                  project.status === 'completed' ? 'bg-blue-500' :
                                  project.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                }
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm mt-2">
                              Partner: {reptiles.find(r => r.id === project.female_id)?.name || "Unknown Female"}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {reptileDetails.breeding_projects_as_dam && reptileDetails.breeding_projects_as_dam.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">As Dam</h4>
                    <div className="space-y-2">
                      {reptileDetails.breeding_projects_as_dam.slice(0, 3).map((project: any) => (
                        <Card key={project.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{project.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(project.start_date)}
                                  {project.end_date ? ` - ${formatDate(project.end_date)}` : " - Present"}
                                </p>
                              </div>
                              <Badge
                                className={
                                  project.status === 'active' ? 'bg-green-500' :
                                  project.status === 'completed' ? 'bg-blue-500' :
                                  project.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                }
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm mt-2">
                              Partner: {reptiles.find(r => r.id === project.male_id)?.name || "Unknown Male"}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {((reptileDetails.breeding_projects_as_sire && reptileDetails.breeding_projects_as_sire.length > 3) ||
                  (reptileDetails.breeding_projects_as_dam && reptileDetails.breeding_projects_as_dam.length > 3)) && (
                  <div className="text-center">
                    <Button variant="link" size="sm">View All Breeding Projects</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {reptileDetails.offspring && reptileDetails.offspring.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Offspring
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {displayOffspring(reptileDetails.offspring)}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 