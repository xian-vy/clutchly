'use client';

import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_COLORS } from "@/lib/constants/colors";
import { Reptile } from "@/lib/types/reptile";
import { format, parseISO } from "date-fns";
import { Baby, CircleHelp, Mars, Venus } from "lucide-react";

interface BreedingTabProps {
  reptiles: Reptile[];
  reptileDetails: DetailedReptile | null
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Total Offspring: {offspring.length}</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {offspring.map((baby: Reptile) => (
            <Card key={baby.id} className="overflow-hidden px-0 py-3 gap-3 border-0">
              <CardContent className="px-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                        <>
                            {baby.sex === 'male' ? (
                              <Mars className="h-4 w-4 text-blue-400 shrink-0"/>
                            ) : baby.sex === 'female' ? (
                              <Venus className="h-4 w-4 text-red-500 shrink-0"/>
                            ) :(
                              <CircleHelp className="h-4 w-4 text-muted-foreground shrink-0"/>
                            )}
                        </>
                       <h4 className="font-medium text-xs sm:text-sm">{baby.name}</h4>
                    </div>
                    <h3 className="font-medium text-[0.7rem] sm:text-xs text-muted-foreground">{baby.reptile_code}</h3>
                    <p className="text-[0.7rem] sm:text-xs text-muted-foreground">
                      {reptiles.find(r => r.id === baby.species_id)?.name || "Unknown Species"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[0.7rem] sm:text-xs">
                  <p className="flex items-center gap-1">
                    Hatched: {formatDate(baby.hatch_date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const hasBreedingProjects = 
    (reptileDetails.breeding_projects_as_sire && reptileDetails.breeding_projects_as_sire.length > 0) ||
    (reptileDetails.breeding_projects_as_dam && reptileDetails.breeding_projects_as_dam.length > 0);

  if (!hasBreedingProjects && (!reptileDetails.offspring || reptileDetails.offspring.length === 0)) {
    return (
      <div className="space-y-4">
        <Card className="px-0 py-3 gap-3 border-0">
          <CardHeader className="p-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Baby className="h-5 w-5" />
              No Breeding History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-muted-foreground text-sm">This reptile has no breeding projects or offspring records.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasBreedingProjects && (
        <Card className="px-0 pt-3 pb-0 gap-3 border-0">
          <CardHeader className="p-0">
            <CardTitle className="text-base flex items-center gap-2 ">
              <Baby className="h-5 w-5" />
              Breeding Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {reptileDetails && (
              <div className="space-y-4">
                {reptileDetails.breeding_projects_as_sire && reptileDetails.breeding_projects_as_sire.length > 0 && (
                  <div>
                    <div className="space-y-2">
                      {reptileDetails.breeding_projects_as_sire.slice(0, 3).map((project) => (
                        <Card key={project.id} className="overflow-hidden px-0 gap-2 border-0">
                          <CardContent className="p-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-xs sm:text-sm">{project.name}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {formatDate(project.start_date)}
                                  {project.end_date ? ` - ${formatDate(project.end_date)}` : " - Present"}
                                </p>
                              </div>
                              <Badge className={`${STATUS_COLORS[project.status]} capitalize`}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm">
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
                    <div className="space-y-2">
                      {reptileDetails.breeding_projects_as_dam.slice(0, 3).map((project) => (
                        <Card key={project.id} className="overflow-hidden px-0 py-3 gap-3 border-0">
                          <CardContent className="p-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-xs sm:text-sm">{project.name}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {formatDate(project.start_date)}
                                  {project.end_date ? ` - ${formatDate(project.end_date)}` : " - Present"}
                                </p>
                              </div>
                              <Badge className={`${STATUS_COLORS[project.status]} capitalize`}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm mt-2">
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
        <Card className="px-0 py-3 gap-3 border-0">
          <CardContent className="p-0">
            {displayOffspring(reptileDetails.offspring)}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 