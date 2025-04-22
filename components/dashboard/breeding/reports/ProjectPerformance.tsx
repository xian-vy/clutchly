'use client';

import { ClutchWithHatchlings, DetailedBreedingProject } from '@/app/api/breeding/reports';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronRight, Info, Mars, Venus } from 'lucide-react';

interface ProjectPerformanceProps {
  data?: DetailedBreedingProject[];
}

export function ProjectPerformance({ data }: ProjectPerformanceProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No breeding projects found with the current filters.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate project performance metrics
  const projectStats = data.map(project => {
    const totalEggs = project.clutches.reduce((sum: number, clutch: ClutchWithHatchlings) => sum + (clutch.egg_count || 0), 0);
    const totalFertile = project.clutches.reduce((sum: number, clutch: ClutchWithHatchlings) => sum + (clutch.fertile_count || 0), 0);
    const totalHatchlings = project.clutches.reduce((sum: number, clutch: ClutchWithHatchlings) => 
      sum + (clutch.hatchlings?.length || 0), 0);
    
    const fertilityRate = totalEggs > 0 ? Math.round((totalFertile / totalEggs) * 100) : 0;
    const hatchRate = totalFertile > 0 ? Math.round((totalHatchlings / totalFertile) * 100) : 0;
    const overallSuccess = totalEggs > 0 ? Math.round((totalHatchlings / totalEggs) * 100) : 0;
    
    return {
      ...project,
      metrics: {
        totalEggs,
        totalFertile,
        totalHatchlings,
        fertilityRate,
        hatchRate,
        overallSuccess
      }
    };
  });
  
  // Sort projects by overall success rate
  const sortedProjects = [...projectStats].sort((a, b) => 
    b.metrics.overallSuccess - a.metrics.overallSuccess
  );

  const getSuccessColor = (rate: number) => {
    if (rate >= 70) return 'bg-emerald-100 dark:bg-emerald-900 data-[state=progress]:bg-emerald-500';
    if (rate >= 40) return 'bg-gray-100 dark:bg-gray-900 data-[state=progress]:bg-gray-500';
    return 'bg-gray-100  dark:bg-gray-900  data-[state=progress]:bg-gray-500';
  };
  
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>Project Performance Overview</CardTitle>
          <CardDescription>
            Detailed analysis of breeding project outcomes and success rates
          </CardDescription>
        </CardHeader>
        <CardContent className="py-0 px-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-medium">Project</TableHead>
                  <TableHead className="font-medium">Species</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Fertility Rate</TableHead>
                  <TableHead className="font-medium">Hatch Rate</TableHead>
                  <TableHead className="font-medium">Overall Success</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project, index) => (
                  <TableRow key={project.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                    <TableCell className="font-medium text-start">
                      <div className="flex flex-col">
                        <span>{project.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Started {format(new Date(project.start_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-start'>{project.species?.name || 'Unknown'}</TableCell>
                    <TableCell className='text-start'>
                      <Badge 
                        variant="custom" 
                        className={`${STATUS_COLORS[project.status.toLowerCase() as keyof typeof STATUS_COLORS]} capitalize`}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-start'>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={project.metrics.fertilityRate} 
                          className={cn("h-2 w-20", 
                            project.metrics.fertilityRate >= 70 ? 'bg-emerald-100 data-[state=progress]:bg-emerald-500' : 
                            project.metrics.fertilityRate >= 40 ? 'bg-gray-100 dark:bg-gray-900 data-[state=progress]:bg-gray-500' : 
                            'bg-gray-100 dark:bg-gray-900 data-[state=progress]:bg-gray-500'
                          )}
                        />
                        <span className="text-sm font-medium">{project.metrics.fertilityRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-start'>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={project.metrics.hatchRate} 
                          className={cn("h-2 w-20", 
                            project.metrics.hatchRate >= 70 ? 'bg-emerald-100 data-[state=progress]:bg-emerald-500' : 
                            project.metrics.hatchRate >= 40 ? 'bg-gray-100 dark:bg-gray-900 data-[state=progress]:bg-gray-500' : 
                            'bg-gray-100 dark:bg-gray-900 data-[state=progress]:bg-gray-500'
                          )}
                        />
                        <span className="text-sm font-medium">{project.metrics.hatchRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-start'>
                      <HoverCard>
                        <HoverCardTrigger>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={project.metrics.overallSuccess} 
                              className={cn("h-2 w-20", getSuccessColor(project.metrics.overallSuccess))} 
                            />
                            <span className="text-sm font-medium flex items-center gap-1">
                              {project.metrics.overallSuccess}%
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-4 shadow-lg border-none">
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Success Breakdown</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Eggs</span>
                                <span className="text-sm font-medium">{project.metrics.totalEggs}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Fertile Eggs</span>
                                <span className="text-sm font-medium">
                                  {project.metrics.totalFertile} 
                                  <span className="text-xs text-muted-foreground ml-1">({project.metrics.fertilityRate}%)</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Hatchlings</span>
                                <span className="text-sm font-medium">
                                  {project.metrics.totalHatchlings}
                                  <span className="text-xs text-muted-foreground ml-1">({project.metrics.hatchRate}% of fertile)</span>
                                </span>
                              </div>
                              <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Overall Success</span>
                                  <span className="text-sm font-bold">
                                    {project.metrics.overallSuccess}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-sm lg:text-base font-medium ml-1">Detailed Project Performance</h3>
        
        <Accordion type="single" collapsible className="space-y-4">
          {sortedProjects.map(project => (
            <AccordionItem 
              key={project.id} 
              value={project.id}
              className="border rounded-lg shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline px-4 py-3 group">
                <div className="flex items-center gap-4 w-full">
                  <div className="font-medium">{project.name}</div>
                  <Badge 
                    variant="custom" 
                    className={`${STATUS_COLORS[project.status.toLowerCase() as keyof typeof STATUS_COLORS]} capitalize`}
                  >
                    {project.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {project.metrics.totalHatchlings} hatchlings from {project.metrics.totalEggs} eggs
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 ml-auto group-data-[state=open]:rotate-90 text-muted-foreground" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-muted/5">
                <div className="space-y-6 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Parents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-8">
                          <div className="flex items-start gap-2">
                            <Mars className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium">
                                {project.male?.name || 'Unknown Male'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {project.maleMorph || 'Unknown morph'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Venus className="h-4 w-4 text-pink-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium">
                                {project.female?.name || 'Unknown Female'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {project.femaleMorph || 'Unknown morph'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Project Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div className="text-muted-foreground">Species</div>
                          <div className="font-medium">{project.species?.name || 'Unknown'}</div>
                          <div className="text-muted-foreground">Start Date</div>
                          <div className="font-medium">{format(new Date(project.start_date), 'MMM d, yyyy')}</div>
                          {project.end_date && (
                            <>
                              <div className="text-muted-foreground">End Date</div>
                              <div className="font-medium">{format(new Date(project.end_date), 'MMM d, yyyy')}</div>
                            </>
                          )}
                          {project.expected_hatch_date && (
                            <>
                              <div className="text-muted-foreground">Expected Hatch</div>
                              <div className="font-medium">{format(new Date(project.expected_hatch_date), 'MMM d, yyyy')}</div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Clutches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="table" className="w-full">
                        <TabsList className="mb-4 w-full justify-start">
                          <TabsTrigger value="table" className="rounded-md">Table View</TabsTrigger>
                          <TabsTrigger value="stats" className="rounded-md">Statistics</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="table" className="mt-0">
                          {project.clutches.length > 0 ? (
                            <div className="overflow-x-auto -mx-4">
                              <Table>
                                <TableHeader className="bg-muted/30">
                                  <TableRow>
                                    <TableHead className="font-medium">Lay Date</TableHead>
                                    <TableHead className="font-medium">Total Eggs</TableHead>
                                    <TableHead className="font-medium">Fertile Eggs</TableHead>
                                    <TableHead className="font-medium">Hatchlings</TableHead>
                                    <TableHead className="font-medium">Success Rate</TableHead>
                                    <TableHead className="font-medium">Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {project.clutches.map((clutch: ClutchWithHatchlings, index: number) => {
                                    const hatchlings = clutch.hatchlings?.length || 0;
                                    const fertileRate = clutch.egg_count > 0 
                                      ? Math.round((clutch.fertile_count / clutch.egg_count) * 100) 
                                      : 0;
                                    const hatchRate = clutch.fertile_count > 0 
                                      ? Math.round((hatchlings / clutch.fertile_count) * 100) 
                                      : 0;
                                    
                                    return (
                                      <TableRow key={clutch.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                                        <TableCell  className='text-start'>
                                          {format(new Date(clutch.lay_date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell  className='text-start'>{clutch.egg_count || 0}</TableCell>
                                        <TableCell  className='text-start'>
                                          <span className="font-medium">{clutch.fertile_count || 0}</span>
                                          <span className="text-xs text-muted-foreground ml-1">({fertileRate}%)</span>
                                        </TableCell>
                                        <TableCell  className='text-start'>{hatchlings}</TableCell>
                                        <TableCell  className='text-start'>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={hatchRate} 
                                              className={cn("h-2 w-16", getSuccessColor(hatchRate))}
                                            />
                                            <span className="text-sm font-medium">{hatchRate}%</span>
                                          </div>
                                        </TableCell>
                                        <TableCell  className='text-start'>
                                          <Badge 
                                            variant="outline" 
                                            className={cn(
                                              "capitalize",
                                              clutch.incubation_status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                              clutch.incubation_status === "in_progress" ? "border-gray-200 bg-gray-50 text-gray-700" :
                                              "border-muted bg-muted/50"
                                            )}
                                          >
                                            {clutch.incubation_status.replace('_', ' ')}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-6 border rounded-md bg-muted/10">
                              <p className="text-sm text-muted-foreground">No clutches recorded</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="stats" className="mt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="border-none shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Fertility Rate</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{project.metrics.fertilityRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                  {project.metrics.totalFertile} of {project.metrics.totalEggs} eggs fertile
                                </p>
                                <Progress 
                                  value={project.metrics.fertilityRate} 
                                  className={cn("h-1.5 mt-2", getSuccessColor(project.metrics.fertilityRate))}
                                />
                              </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Hatch Rate</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{project.metrics.hatchRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                  {project.metrics.totalHatchlings} of {project.metrics.totalFertile} fertile eggs hatched
                                </p>
                                <Progress 
                                  value={project.metrics.hatchRate} 
                                  className={cn("h-1.5 mt-2", getSuccessColor(project.metrics.hatchRate))}
                                />
                              </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Success</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{project.metrics.overallSuccess}%</div>
                                <p className="text-xs text-muted-foreground">
                                  {project.metrics.totalHatchlings} hatchlings from {project.metrics.totalEggs} eggs
                                </p>
                                <Progress 
                                  value={project.metrics.overallSuccess} 
                                  className={cn("h-1.5 mt-2", getSuccessColor(project.metrics.overallSuccess))}
                                />
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                  
                  {project.notes && (
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{project.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
} 