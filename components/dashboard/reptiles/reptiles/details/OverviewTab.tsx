'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEVERITY_COLORS,  STATUS_COLORS, YES_NO_COLORS } from "@/lib/constants/colors";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Calendar, DollarSign,  Info,  MapPin, Notebook, Ruler, User, Weight } from "lucide-react";
import { EnrichedReptile } from "../ReptileList";
import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
import { HealthLogEntryWithCategory } from "@/lib/types/health";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPrice } from "@/lib/utils";

interface OverviewTabProps {
  reptile: EnrichedReptile;
  reptileDetails: DetailedReptile | null;
}

export function OverviewTab({ reptile, reptileDetails }: OverviewTabProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  const calculateAge = (hatchDate: string | null) => {
    if (!hatchDate) return "Unknown";
    const birth = new Date(hatchDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) {
      return `${months} months`;
    }
    return `${years} years, ${months} months`;
  };
  const isBreeder = (reptile.project_ids?.length ?? 0) > 0 || reptile.is_breeder;

  return (
    <div className="space-y-4 2xl:space-y-5 3xl:!space-y-10 mt-2">
      <Card className="px-0 gap-2 border-0 py-1 xl:py-2 ">
        <CardHeader className="px-0 ">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-3 3xl:gap-y-5 px-0 sm:px-2">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Species</p>
            <p className="text-xs sm:text-sm font-medium">{reptile.species_name}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Morph</p>
            <p className="text-xs sm:text-sm font-medium">{reptile.morph_name}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Breeder</p>
            <Badge
                variant="custom"
                className={`${YES_NO_COLORS[isBreeder ? 'yes' : 'no']} capitalize`}
              >
                {isBreeder ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
            <Badge variant="custom" className={`${STATUS_COLORS[reptile.status]} capitalize`}>
              {reptile.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      {reptile.location_label ? (
                        <span className="text-xs sm:text-sm truncate w-[80px]">
                          {reptile.location_label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  {reptile.location_label && (
                    <TooltipContent>
                      <p>{reptile.location_label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Age</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{calculateAge(reptile.hatch_date)}</span>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Produced By</p>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="text-xs sm:text-sm capitalize">{reptile.original_breeder}</span>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Price</p>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{formatPrice(reptile.price) || "--"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="px-0 gap-2 py-1 xl:py-2  border-0">
        <CardHeader className="px-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates & Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-3 3xl:gap-y-5 px-0 sm:px-2">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Hatch Date</p>
            <p className="text-xs sm:text-sm font-medium">{formatDate(reptile.hatch_date)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Acquisition Date</p>
            <p className="text-xs sm:text-sm font-medium">{formatDate(reptile.acquisition_date)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Current Weight</p>
            <div className="flex items-center gap-1">
              <Weight className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{reptile.weight} g</span>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Current Length</p>
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{reptile.length} cm</span>
            </div>
          </div>
          {/* <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Created At</p>
            <p className="text-xs sm:text-sm font-medium">{formatDate(reptile.created_at)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Last Updated</p>
            <p className="text-xs sm:text-sm font-medium">{formatDate(reptile.last_modified)}</p>
          </div> */}
        </CardContent>
      </Card>

        <Card className="px-0 py-1 xl:py-2  gap-2 border-0"> 
          <CardHeader className="px-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Notebook className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className=" px-0 sm:px-2">
            <p className="whitespace-pre-wrap text-xs sm:text-sm">{reptile.notes || "No Notes Added"}</p>
          </CardContent>
        </Card>

      {reptileDetails?.health_logs && reptileDetails.health_logs.filter(log => !log.resolved).length > 0 && (
        <Card className="border-yellow-500 py-1 xl:py-2  px-0 gap-2 border-0">
          <CardHeader className="px-0">
            <CardTitle className="text-base flex items-center gap-2 ">
              <AlertTriangle className="h-5 w-5" />
              Active Health Issues
            </CardTitle>
          </CardHeader>
          <CardContent className=" px-0 sm:px-2">
            <ul className="space-y-2">
              {reptileDetails.health_logs
                .filter(log => !log.resolved)
                .slice(0, 3)
                .map((log: HealthLogEntryWithCategory) => (
                  <li key={log.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-xs sm:text-sm">
                        {log.category?.label && <span>{log.category.label}</span>}
                        {log.subcategory?.label && <span> - {log.subcategory.label}</span>}
                      </span>
                      <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(log.date)}</p>
                    </div>
                    <Badge variant="custom" className={`${SEVERITY_COLORS[log.severity ?? 'low']} capitalize`}>
                      {log.severity || 'Low'}
                    </Badge>
                  </li>
                ))}
            </ul>
            {reptileDetails.health_logs.filter(log => !log.resolved).length > 3 && (
              <div className="text-center mt-4">
                <Button variant="outline" size="sm" onClick={() => {
                  const button = document.querySelector('button[value="health"]');
                  if (button) {
                    (button as HTMLButtonElement).click();
                  }
                }}>
                  View All Health Issues
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    
    </div>
  );
} 