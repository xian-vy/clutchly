'use client';

import { GeneticOutcomeResult, MorphDistribution, ProjectInfo } from '@/app/api/breeding/reports';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { AlertCircle, Dna } from 'lucide-react';

// Import recharts
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface GeneticOutcomesProps {
  data?: GeneticOutcomeResult[];
}

export function GeneticOutcomes({ data }: GeneticOutcomesProps) {
  if (!data || data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No genetic outcomes data available for the current filter settings.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Sort pairings by most offspring
  const sortedData = [...data].sort((a, b) => b.total_hatched - a.total_hatched);
  
  // Generate colors for pie chart
  const COLORS = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
    'var(--color-chart-6)',
    'var(--color-chart-7)',
    'var(--color-chart-8)'
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genetic Pairing Outcomes</CardTitle>
          <CardDescription>
            Analysis of genetic results from specific morphs and trait combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pairing</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Clutches</TableHead>
                <TableHead>Fertility Rate</TableHead>
                <TableHead>Hatch Rate</TableHead>
                <TableHead>Offspring</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((pairing, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-start">{pairing.pairing}</TableCell>
                  <TableCell className='text-start'>{pairing.projects_count}</TableCell>
                  <TableCell className='text-start'>{pairing.total_clutches}</TableCell>
                  <TableCell className='text-start'>
                    <div className="flex items-center gap-2">
                      <Progress value={pairing.fertility_rate} className="h-2 w-20" />
                      <span className="text-sm">{pairing.fertility_rate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-start'>
                    <div className="flex items-center gap-2">
                      <Progress value={pairing.hatch_rate} className="h-2 w-20" />
                      <span className="text-sm">{pairing.hatch_rate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-start'>{pairing.total_hatched}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-sm lg:text-base font-semibold flex items-center gap-2">
          <Dna className="h-4 w-4" />
          Detailed Genetic Analysis
        </h3>
        
        <Accordion type="single" collapsible className="space-y-4">
          {sortedData.map((pairing, index) => {
            // Format morph distribution data for pie chart
            const morphData = pairing.morph_distribution.map((morph: MorphDistribution) => ({
              name: morph.morph || 'Unknown',
              value: morph.count,
            }));
            
            return (
              <AccordionItem 
                key={index} 
                value={`pairing-${index}`}
                className="border rounded-md px-6"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="font-medium">
                      {pairing.pairing}
                    </div>
                    <Badge variant="outline">
                      {pairing.total_hatched} offspring
                    </Badge>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {pairing.projects_count} projects, {pairing.total_clutches} clutches
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4">
                    <Card className="shadow-none border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Offspring Morphs</CardTitle>
                        <CardDescription className="text-xs">
                          Morph distribution in hatched offspring
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pairing.total_hatched > 0 ? (
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={morphData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  innerRadius={60}
                                  paddingAngle={2}
                                  label={({ name, percent }) => 
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {morphData.map((_, index: number) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={COLORS[index % COLORS.length]} 
                                    />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value) => [`${value} hatchlings`, 'Count']}
                                  contentStyle={{ 
                                    backgroundColor: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Legend 
                                  formatter={(value) => value}
                                  wrapperStyle={{ 
                                    fontSize: '13px',
                                    color: 'var(--color-foreground)',
                                    paddingTop: '20px'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-8 text-center">
                            No offspring data available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-4">
                      <Card className="shadow-none border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Pairing Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-muted-foreground">Total Clutches</div>
                            <div>{pairing.total_clutches}</div>
                            <div className="text-muted-foreground">Total Eggs</div>
                            <div>{pairing.total_eggs}</div>
                            <div className="text-muted-foreground">Fertile Eggs</div>
                            <div>
                              {pairing.total_fertile} ({pairing.fertility_rate}%)
                            </div>
                            <div className="text-muted-foreground">Hatchlings</div>
                            <div>
                              {pairing.total_hatched} ({pairing.hatch_rate}% of fertile)
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-none border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Morph Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                              <TableHead>Morphs</TableHead>
                                <TableHead>Visual Traits</TableHead>
                                <TableHead>Het Traits</TableHead>
                                <TableHead>Count</TableHead>
                                <TableHead>Percentage</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pairing.morph_distribution.map((morph: MorphDistribution, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium text-start">
                                    {morph.morph || 'Unknown'}
                                  </TableCell>
                                  <TableCell className='text-start'>{morph.visual_traits}</TableCell>
                                  <TableCell className='text-start'>{morph.het_traits?.map((trait) => 
                                    `${trait.trait}${trait.percentage !== 100 ? ` (${trait.percentage}%)` : ''}`
                                  ).join(", ")}</TableCell>
                                  <TableCell className='text-start'>{morph.count}</TableCell>
                                  <TableCell className='text-start'>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={morph.percentage} 
                                        className="h-2 w-16" 
                                      />
                                      <span>{morph.percentage}%</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Projects with this pairing</h4>
                    <div className="flex flex-wrap gap-2">
                      {pairing.projects.map((project: ProjectInfo) => (
                        <Badge key={project.id} variant="secondary">
                          {project.name} ({format(new Date(project.start_date), 'MMM yyyy')})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Genetic Insights</CardTitle>
          <CardDescription>
            Key findings from breeding outcomes data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="success">
            <TabsList>
              <TabsTrigger value="success">Most Successful</TabsTrigger>
              <TabsTrigger value="fertile">Highest Fertility</TabsTrigger>
              <TabsTrigger value="diverse">Most Diverse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="success" className="mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Most Successful Pairings</h4>
                <p className="text-sm text-muted-foreground">
                  These pairings produced the highest percentage of viable offspring from fertile eggs
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pairing</TableHead>
                      <TableHead>Hatch Rate</TableHead>
                      <TableHead>Total Hatched</TableHead>
                      <TableHead>Projects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...data]
                      .sort((a, b) => b.hatch_rate - a.hatch_rate)
                      .slice(0, 5)
                      .map((pairing, idx) => (
                        <TableRow key={idx}>
                          <TableCell className='text-start'>{pairing.pairing}</TableCell>
                          <TableCell className="font-medium text-start">{pairing.hatch_rate}%</TableCell>
                          <TableCell className='text-start'>{pairing.total_hatched}</TableCell>
                          <TableCell className='text-start'>{pairing.projects_count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="fertile" className="mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Highest Fertility Pairings</h4>
                <p className="text-sm text-muted-foreground">
                  These pairings produced the highest percentage of fertile eggs
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pairing</TableHead>
                      <TableHead>Fertility Rate</TableHead>
                      <TableHead>Total Eggs</TableHead>
                      <TableHead>Projects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...data]
                      .sort((a, b) => b.fertility_rate - a.fertility_rate)
                      .slice(0, 5)
                      .map((pairing, idx) => (
                        <TableRow key={idx}>
                          <TableCell className='text-start'>{pairing.pairing}</TableCell>
                          <TableCell className="font-medium text-start">{pairing.fertility_rate}%</TableCell>
                          <TableCell className='text-start'>{pairing.total_eggs}</TableCell>
                          <TableCell className='text-start'>{pairing.projects_count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="diverse" className="mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Most Diverse Outcomes</h4>
                <p className="text-sm text-muted-foreground">
                  These pairings produced the widest variety of different phenotypes
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pairing</TableHead>
                      <TableHead>Phenotype Count</TableHead>
                      <TableHead>Total Hatched</TableHead>
                      <TableHead>Projects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...data]
                      .sort((a, b) => b.morph_distribution.length - a.morph_distribution.length)
                      .slice(0, 5)
                      .map((pairing, idx) => (
                        <TableRow key={idx}>
                          <TableCell className='text-start'>{pairing.pairing}</TableCell>
                          <TableCell className="font-medium text-start">{pairing.morph_distribution.length}</TableCell>
                          <TableCell className='text-start'>{pairing.total_hatched}</TableCell>
                          <TableCell className='text-start'>{pairing.projects_count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 