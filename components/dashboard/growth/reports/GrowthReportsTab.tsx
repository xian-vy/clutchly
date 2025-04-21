'use client';

import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroupedReptiles } from '@/lib/hooks/useGroupedReptiles';
import { useGrowthStore } from '@/lib/stores/growthStore';
import { Reptile } from '@/lib/types/reptile';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function GrowthReportsTab() {
  const [selectedReptileId, setSelectedReptileId] = useState<string>('');
  const { ReptileSelect } = useGroupedReptiles()

  const { 
    entries, 
    fetchEntries,
    getEntriesByReptile,
    isLoading: growthStoreLoading
  } = useGrowthStore();

  const { data: reptiles = [], isLoading: reptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Fetch growth entries if not already loaded
  useEffect(() => {
    if (entries.length === 0) {
      fetchEntries();
    }
  }, [entries.length, fetchEntries]);

  useEffect(() => {
    if (selectedReptileId) {
      fetchEntries();
    }
  }, [selectedReptileId, fetchEntries]);

  // Get entries for the selected reptile
  const reptileEntries = selectedReptileId 
    ? getEntriesByReptile(selectedReptileId)
    : [];

  // Format data for the chart
  const chartData = reptileEntries.map(entry => ({
    date: format(new Date(entry.date), 'MMM d, yyyy'),
    weight: entry.weight,
    length: entry.length,
    // Adding formatted display values for tooltip
    weightDisplay: `${entry.weight}g`,
    lengthDisplay: `${entry.length}cm`,
  }));

  // Calculate growth statistics
  const calculateGrowthStats = () => {
    if (reptileEntries.length < 2) return null;
    
    // Sort entries by date
    const sortedEntries = [...reptileEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    
    const daysBetween = Math.floor(
      (new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const weightGain = lastEntry.weight - firstEntry.weight;
    const lengthGain = lastEntry.length - firstEntry.length;
    
    const weightGainPerDay = daysBetween > 0 ? weightGain / daysBetween : 0;
    const lengthGainPerDay = daysBetween > 0 ? lengthGain / daysBetween : 0;
    
    const weightGainPercentage = firstEntry.weight > 0 ? (weightGain / firstEntry.weight) * 100 : 0;
    const lengthGainPercentage = firstEntry.length > 0 ? (lengthGain / firstEntry.length) * 100 : 0;
    
    return {
      firstDate: firstEntry.date,
      lastDate: lastEntry.date,
      daysBetween,
      weightGain,
      lengthGain,
      weightGainPerDay,
      lengthGainPerDay,
      weightGainPercentage,
      lengthGainPercentage,
      firstWeight: firstEntry.weight,
      lastWeight: lastEntry.weight,
      firstLength: firstEntry.length,
      lastLength: lastEntry.length,
    };
  };

  const growthStats = calculateGrowthStats();
  const isLoading = growthStoreLoading || reptilesLoading;
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'weight' | 'length'>('both');

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center float-left max-w-[270px] space-x-4 w-full">
          <ReptileSelect
            value={selectedReptileId}
            onValueChange={setSelectedReptileId}
            placeholder="Select a reptile"
        />
      </div>

      {selectedReptileId && reptileEntries.length > 0 ? (
        <Tabs defaultValue="overview" className="w-full space-y-5">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Growth Charts</TabsTrigger>
            <TabsTrigger value="data">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Summary</CardTitle>
                <CardDescription>Key growth metrics for {reptiles.find(r => r.id === selectedReptileId)?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {growthStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Time Period</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">First Measurement</p>
                          <p className="font-medium">{format(new Date(growthStats.firstDate), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Measurement</p>
                          <p className="font-medium">{format(new Date(growthStats.lastDate), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{growthStats.daysBetween} days</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Growth Metrics</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Weight Gain</p>
                          <p className="font-medium">{growthStats.weightGain.toFixed(1)}g ({growthStats.weightGainPercentage.toFixed(1)}%)</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Length Gain</p>
                          <p className="font-medium">{growthStats.lengthGain.toFixed(1)}cm ({growthStats.lengthGainPercentage.toFixed(1)}%)</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Daily Weight Gain</p>
                          <p className="font-medium">{growthStats.weightGainPerDay.toFixed(2)}g/day</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Daily Length Gain</p>
                          <p className="font-medium">{growthStats.lengthGainPerDay.toFixed(2)}cm/day</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Not enough data to calculate growth statistics. Need at least 2 measurements.</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Growth Insights</CardTitle>
                <CardDescription>Analysis and recommendations based on growth data</CardDescription>
              </CardHeader>
              <CardContent>
                {growthStats ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Growth Rate Analysis</h3>
                      <p>
                        {growthStats.weightGainPerDay > 0.5 
                          ? "Your reptile is showing excellent growth rates. Continue with current feeding and husbandry practices."
                          : growthStats.weightGainPerDay > 0.2
                            ? "Growth rate is within normal range. Monitor for any changes in appetite or behavior."
                            : "Growth rate is slower than expected. Consider reviewing diet, temperature, and overall husbandry."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Continue regular weight and length measurements every 2-4 weeks</li>
                        <li>Document any changes in feeding behavior or appetite</li>
                        <li>Consider seasonal variations in growth rates</li>
                        <li>Compare with species-specific growth charts if available</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>Not enough data to provide growth insights. Add more measurements to get personalized recommendations.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Growth Progress</CardTitle>
                  <CardDescription>Combined weight and length measurements over time</CardDescription>
                </div>
                <select 
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
                >
                  <option value="both">Show Both</option>
                  <option value="weight">Weight Only</option>
                  <option value="length">Length Only</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData.reverse()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="var(--color-border)"
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                      />
                      {(selectedMetric === 'both' || selectedMetric === 'weight') && (
                        <YAxis 
                          yAxisId="weight"
                          label={{ 
                            value: 'Weight (g)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fill: 'var(--color-muted-foreground)' }
                          }}
                          stroke="var(--color-chart-1)"
                          fontSize={12}
                        />
                      )}
                      {(selectedMetric === 'both' || selectedMetric === 'length') && (
                        <YAxis 
                          yAxisId="length"
                          orientation="right"
                          label={{ 
                            value: 'Length (cm)', 
                            angle: 90, 
                            position: 'insideRight',
                            style: { fill: 'var(--color-muted-foreground)' }
                          }}
                          stroke="var(--color-chart-2)"
                          fontSize={12}
                        />
                      )}
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'weight') return [`${value}g`, 'Weight'];
                          if (name === 'length') return [`${value}cm`, 'Length'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
                      />
                      <Legend 
                        formatter={(value) => {
                          if (value === 'weight') return 'Weight (g)';
                          if (value === 'length') return 'Length (cm)';
                          return value;
                        }}
                        wrapperStyle={{ 
                          fontSize: '13px',
                          color: 'var(--foreground)' 
                        }}
                      />
                      {(selectedMetric === 'both' || selectedMetric === 'weight') && (
                        <Line 
                          yAxisId="weight"
                          type="monotone" 
                          dataKey="weight" 
                          stroke="var(--color-chart-1)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: 'var(--color-chart-1)' }}
                          activeDot={{ r: 6, fill: 'var(--color-chart-1)' }}
                        />
                      )}
                      {(selectedMetric === 'both' || selectedMetric === 'length') && (
                        <Line 
                          yAxisId="length"
                          type="monotone" 
                          dataKey="length" 
                          stroke="var(--color-chart-2)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: 'var(--color-chart-2)' }}
                          activeDot={{ r: 6, fill: 'var(--color-chart-2)' }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Growth Data</CardTitle>
                <CardDescription>Raw growth measurements for {reptiles.find(r => r.id === selectedReptileId)?.name}</CardDescription>
              </CardHeader>
              <CardContent>
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
                    {reptileEntries
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{entry.weight}</TableCell>
                          <TableCell>{entry.length}</TableCell>
                          <TableCell>{entry.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-10">
          {selectedReptileId ? (
            <p>No growth data available for this reptile.</p>
          ) : (
            <p>Select a reptile to view growth reports.</p>
          )}
        </div>
      )}
    </div>
  );
}