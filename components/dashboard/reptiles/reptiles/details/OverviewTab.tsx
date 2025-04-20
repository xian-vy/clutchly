'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEX_COLORS, STATUS_COLORS } from "@/lib/constants/colors";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Calendar, Heart, Info, LineChart, MapPin, Ruler, Weight } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';
import { EnrichedReptile } from "../ReptileList";
import { EnrichedHealthLogEntry, ExtendedDetailedReptile } from "./types";

interface OverviewTabProps {
  reptile: EnrichedReptile;
  reptileDetails: ExtendedDetailedReptile | null;
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

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Species</p>
            <p className="font-medium">{reptile.species_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Morph</p>
            <p className="font-medium">{reptile.morph_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sex</p>
            <Badge variant="custom" className={SEX_COLORS[reptile.sex]}>
              {reptile.sex}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant="custom" className={STATUS_COLORS[reptile.status]}>
              {reptile.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{reptile.location_label || "Not assigned"}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{calculateAge(reptile.hatch_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dates & Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Hatch Date</p>
            <p className="font-medium">{formatDate(reptile.hatch_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Acquisition Date</p>
            <p className="font-medium">{formatDate(reptile.acquisition_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">{formatDate(reptile.last_modified)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Weight</p>
            <div className="flex items-center gap-1">
              <Weight className="h-4 w-4" />
              <span>{reptile.weight} g</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Length</p>
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span>{reptile.length} cm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {reptile.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{reptile.notes}</p>
          </CardContent>
        </Card>
      )}

      {reptileDetails?.health_logs && reptileDetails.health_logs.filter(log => !log.resolved).length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Active Health Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reptileDetails.health_logs
                .filter(log => !log.resolved)
                .slice(0, 3)
                .map((log: EnrichedHealthLogEntry) => (
                  <li key={log.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {log.category?.label && <span>{log.category.label}</span>}
                        {log.subcategory?.label && <span> - {log.subcategory.label}</span>}
                      </span>
                      <p className="text-sm text-muted-foreground">{formatDate(log.date)}</p>
                    </div>
                    <Badge variant={log.severity === 'high' ? 'destructive' : log.severity === 'moderate' ? 'secondary' : 'outline'}>
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

      {reptileDetails?.growth_history && reptileDetails.growth_history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={reptileDetails.growth_history
                  .slice(0, 10)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(entry => ({
                    date: format(parseISO(entry.date), "MMM dd"),
                    weight: entry.weight
                  }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  minTickGap={15}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}

                />
                <YAxis 
                  width={30}
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <CartesianGrid                     
                    strokeDasharray="3 3" 
                    stroke="var(--color-border)"
                />
                <RechartsTooltip 
                  contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  name="Weight (g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 