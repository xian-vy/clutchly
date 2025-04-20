'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEX_COLORS, STATUS_COLORS, YES_NO_COLORS } from "@/lib/constants/colors";
import { EnrichedReptile } from "./ReptileList";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar, Weight, Ruler, Dna, Info, AlertTriangle,  LineChart, Heart, Baby, Utensils, Users, Star, Plus } from "lucide-react";
import { Reptile } from "@/lib/types/reptile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailedReptile, getReptileDetails } from "@/app/api/reptiles/reptileDetails";
import { useEffect, useState } from "react";
import { GrowthEntry } from "@/lib/types/growth";
import { HealthLogEntry } from "@/lib/types/health";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { FeedingEvent } from "@/lib/types/feeding";

// Extend HealthLogEntry with the joined fields from the query
interface EnrichedHealthLogEntry extends HealthLogEntry {
  category?: { label: string };
  subcategory?: { label: string };
  type?: { label: string };
}

// Extend the DetailedReptile type to use our custom health log type
interface ExtendedDetailedReptile extends Omit<DetailedReptile, 'health_logs'> {
  health_logs: EnrichedHealthLogEntry[];
}

interface ReptileDetailsDialogProps {
  reptile: EnrichedReptile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: Reptile[];
}

interface ReptileDetailsState {
  loading: boolean;
  data: ExtendedDetailedReptile | null;
  error: Error | null;
}

export function ReptileDetailsDialog({ 
  reptile, 
  open, 
  onOpenChange,
  reptiles 
}: ReptileDetailsDialogProps) {
  const [reptileDetails, setReptileDetails] = useState<ReptileDetailsState>({
    loading: false,
    data: null,
    error: null
  });

  useEffect(() => {
    if (open && reptile) {
      setReptileDetails({ loading: true, data: null, error: null });
      
      getReptileDetails(reptile.id)
        .then(data => {
          setReptileDetails({ loading: false, data: data as unknown as ExtendedDetailedReptile, error: null });
        })
        .catch(error => {
          console.error("Error fetching reptile details:", error);
          setReptileDetails({ loading: false, data: null, error });
        });
    } else {
      setReptileDetails({ loading: false, data: null, error: null });
    }
  }, [open, reptile]);

  if (!reptile) return null;

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

  const displayGrowthData = (growthHistory: GrowthEntry[]) => {
    if (!growthHistory || growthHistory.length === 0) {
      return <p className="text-muted-foreground">No growth data available</p>;
    }

    // Format data for the chart
    const chartData = growthHistory
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: format(parseISO(entry.date), "MMM dd, yyyy"),
        weight: entry.weight,
        length: entry.length
      }));

    return (
      <div className="space-y-6">
        <div className="h-72">
          <p className="text-sm font-medium mb-2">Weight History (g)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis 
                width={30}
              />
              <CartesianGrid strokeDasharray="3 3" />
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <p className="text-sm font-medium mb-2">Length History (cm)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLength" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis 
                width={30}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <RechartsTooltip 
                contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                labelStyle={{ color: "#9ca3af" }}
                itemStyle={{ color: "#ffffff" }}
              />
              <Area
                type="monotone"
                dataKey="length"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorLength)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Growth Log</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weight (g)</TableHead>
                <TableHead>Length (cm)</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {growthHistory.slice(0, 5).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.weight} g</TableCell>
                  <TableCell>{entry.length} cm</TableCell>
                  <TableCell>{entry.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {growthHistory.length > 5 && (
            <div className="text-center mt-2">
              <Button variant="link" size="sm">View All Growth Records</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayHealthData = (healthLogs: HealthLogEntry[]) => {
    if (!healthLogs || healthLogs.length === 0) {
      return <p className="text-muted-foreground">No health records available</p>;
    }

    // Group health logs by resolved status
    const activeIssues = healthLogs.filter(log => !log.resolved);
    const resolvedIssues = healthLogs.filter(log => log.resolved);

    return (
      <div className="space-y-6">
        {activeIssues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Active Health Issues ({activeIssues.length})
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeIssues.slice(0, 5).map((entry) => {
                  // Type assertion for joined fields
                  const healthEntry = entry as any;
                  return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      {healthEntry.category?.label && <span>{healthEntry.category.label}</span>}
                      {healthEntry.subcategory?.label && <span> - {healthEntry.subcategory.label}</span>}
                      {healthEntry.type?.label && <span> - {healthEntry.type.label}</span>}
                      {entry.custom_type_label && <span> - {entry.custom_type_label}</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.severity === 'high' ? 'destructive' : entry.severity === 'moderate' ? 'secondary' : 'outline'}>
                        {entry.severity || 'Low'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>
        )}

        {resolvedIssues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Past Health Records</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedIssues.slice(0, 3).map((entry) => {
                  // Type assertion for joined fields
                  const healthEntry = entry as any;
                  return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      {healthEntry.category?.label && <span>{healthEntry.category.label}</span>}
                      {healthEntry.subcategory?.label && <span> - {healthEntry.subcategory.label}</span>}
                      {healthEntry.type?.label && <span> - {healthEntry.type.label}</span>}
                      {entry.custom_type_label && <span> - {entry.custom_type_label}</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.severity || 'Low'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
            {resolvedIssues.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="link" size="sm">View All Health Records</Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const displayFeedingHistory = (feedingHistory: FeedingEvent[]) => {
    if (!feedingHistory || feedingHistory.length === 0) {
      return <p className="text-muted-foreground">No feeding history available</p>;
    }

    // Calculate feeding statistics
    const totalEvents = feedingHistory.length;
    const fedEvents = feedingHistory.filter(event => event.fed).length;
    const fedPercentage = totalEvents > 0 ? Math.round((fedEvents / totalEvents) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Feeding Success Rate</h4>
          <Progress value={fedPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">{fedPercentage}% success rate ({fedEvents} out of {totalEvents} feeds)</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Recent Feeding History</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedingHistory.slice(0, 5).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.scheduled_date)}</TableCell>
                  <TableCell>
                    <Badge variant={entry.fed ? "custom" : "destructive"} className={entry.fed ? YES_NO_COLORS.yes : ""}>
                      {entry.fed ? "Fed" : "Refused"}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {feedingHistory.length > 5 && (
            <div className="text-center mt-2">
              <Button variant="link" size="sm">View Complete Feeding History</Button>
            </div>
          )}
        </div>
      </div>
    );
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
          {offspring.slice(0, 4).map((baby) => (
            <Card key={baby.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{baby.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {reptiles.find(r => r.id === baby.species_id)?.name || "Unknown Species"}
                    </p>
                  </div>
                  <Badge variant="custom" className={SEX_COLORS[baby.sex]}>
                    {baby.sex}
                  </Badge>
                </div>
                <div className="mt-2 text-sm">
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
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

  const renderLoadingContent = () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );

  const renderErrorContent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium">Failed to load reptile details</h3>
      <p className="text-muted-foreground mt-2">
        {reptileDetails.error?.message || "An unknown error occurred"}
      </p>
      <Button variant="outline" className="mt-4" onClick={() => setReptileDetails({ loading: true, data: null, error: null })}>
        Try Again
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-screen-md lg:max-w-screen-lg h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl flex items-center gap-2">
            {reptile.name}
            <div className="flex gap-2">
              {reptile.is_breeder && (
                <Badge variant="custom" className={YES_NO_COLORS.yes}>
                  Breeder
                </Badge>
              )}
              {reptile.retired_breeder && (
                <Badge variant="custom" className="bg-gray-500">
                  Retired
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full h-full">
          <TabsList className="px-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="genetics">Genetics</TabsTrigger>
            {reptile.is_breeder && (
              <TabsTrigger value="breeding">Breeding</TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="h-[calc(90vh-140px)] px-6">
            {reptileDetails.loading ? (
              renderLoadingContent()
            ) : reptileDetails.error ? (
              renderErrorContent()
            ) : (
              <>
                <TabsContent value="overview" className="space-y-4 mt-4">
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

                  {reptileDetails.data && reptileDetails.data.health_logs && reptileDetails.data.health_logs.filter(log => !log.resolved).length > 0 && (
                    <Card className="border-yellow-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-yellow-500">
                          <AlertTriangle className="h-5 w-5" />
                          Active Health Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {reptileDetails.data.health_logs
                            .filter(log => !log.resolved)
                            .slice(0, 3)
                            .map(log => (
                              <li key={log.id} className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">
                                    {(log as any).category?.label && <span>{(log as any).category.label}</span>}
                                    {(log as any).subcategory?.label && <span> - {(log as any).subcategory.label}</span>}
                                  </span>
                                  <p className="text-sm text-muted-foreground">{formatDate(log.date)}</p>
                                </div>
                                <Badge variant={log.severity === 'high' ? 'destructive' : log.severity === 'moderate' ? 'secondary' : 'outline'}>
                                  {log.severity || 'Low'}
                                </Badge>
                              </li>
                            ))}
                        </ul>
                        {reptileDetails.data.health_logs.filter(log => !log.resolved).length > 3 && (
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

                  {reptileDetails.data?.growth_history && reptileDetails.data.growth_history.length > 0 && (
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
                            data={reptileDetails.data.growth_history
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
                            />
                            <YAxis 
                              width={30}
                            />
                            <CartesianGrid strokeDasharray="3 3" />
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
                </TabsContent>

                <TabsContent value="growth" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Growth History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      {reptileDetails.data && displayGrowthData(reptileDetails.data.growth_history)}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="health" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Health Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      {reptileDetails.data && displayHealthData(reptileDetails.data.health_logs)}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feeding" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Feeding History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                      {reptileDetails.data && displayFeedingHistory(reptileDetails.data.feeding_history)}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="genetics" className="space-y-4 mt-4">
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
                </TabsContent>

                {reptile.is_breeder && (
                  <TabsContent value="breeding" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Baby className="h-5 w-5" />
                          Breeding Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        {reptileDetails.data && (
                          <>
                            {reptileDetails.data.breeding_projects_as_sire.length === 0 && 
                             reptileDetails.data.breeding_projects_as_dam.length === 0 ? (
                              <p className="text-muted-foreground">No breeding projects found</p>
                            ) : (
                              <div className="space-y-6">
                                {reptileDetails.data.breeding_projects_as_sire.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">As Sire</h4>
                                    <div className="space-y-2">
                                      {reptileDetails.data.breeding_projects_as_sire.slice(0, 3).map(project => (
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
                                              <Badge variant="custom" className={
                                                project.status === 'active' ? 'bg-green-500' :
                                                project.status === 'completed' ? 'bg-blue-500' :
                                                project.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                              }>
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
                                
                                {reptileDetails.data.breeding_projects_as_dam.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">As Dam</h4>
                                    <div className="space-y-2">
                                      {reptileDetails.data.breeding_projects_as_dam.slice(0, 3).map(project => (
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
                                              <Badge variant="custom" className={
                                                project.status === 'active' ? 'bg-green-500' :
                                                project.status === 'completed' ? 'bg-blue-500' :
                                                project.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                              }>
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

                                {(reptileDetails.data.breeding_projects_as_sire.length > 3 ||
                                  reptileDetails.data.breeding_projects_as_dam.length > 3) && (
                                  <div className="text-center">
                                    <Button variant="link" size="sm">View All Breeding Projects</Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Offspring
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        {reptileDetails.data && displayOffspring(reptileDetails.data.offspring)}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}