'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthLogEntry } from '@/lib/types/health';
import { Reptile } from '@/lib/types/reptile';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';

interface AnalysisTabProps {
  categoryDistribution: { name: string; count: number }[];
  monthlyTrends: { month: string; total: number; resolved: number; active: number }[];
  filteredLogs: HealthLogEntry[];
  reptiles: Reptile[];
  categories: any[];
  stats: {
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
    highSeverityIssues: number;
    moderateSeverityIssues: number;
    lowSeverityIssues: number;
    resolutionRate: number;
    avgResolutionDays: number;
  };
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AnalysisTab({
  categoryDistribution,
  monthlyTrends,
  filteredLogs,
  reptiles,
  categories,
  stats
}: AnalysisTabProps) {
  // Prepare data for severity distribution pie chart
  const severityData = [
    { name: 'High', value: stats.highSeverityIssues },
    { name: 'Moderate', value: stats.moderateSeverityIssues },
    { name: 'Low', value: stats.lowSeverityIssues }
  ];

  // Prepare data for status distribution pie chart
  const statusData = [
    { name: 'Active', value: stats.activeIssues },
    { name: 'Resolved', value: stats.resolvedIssues }
  ];

  // Prepare data for reptile health issues bar chart
  const reptileHealthData = reptiles.map(reptile => {
    const reptileLogs = filteredLogs.filter(log => log.reptile_id === reptile.id);
    return {
      name: reptile.name,
      total: reptileLogs.length,
      active: reptileLogs.filter(log => !log.resolved).length,
      resolved: reptileLogs.filter(log => log.resolved).length
    };
  }).filter(data => data.total > 0);

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-500">
            {`${((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of health issues by severity</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Breakdown of health issues by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF8042' : '#00C49F'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Reptile Health Issues</CardTitle>
              <CardDescription>Health issues by reptile</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reptileHealthData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" name="Active Issues" fill="#FF8042" />
                  <Bar dataKey="resolved" name="Resolved Issues" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Health Trends</CardTitle>
              <CardDescription>Health issues over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Total Issues" stroke="#8884d8" />
                  <Line type="monotone" dataKey="active" name="Active Issues" stroke="#FF8042" />
                  <Line type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#00C49F" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Analysis</CardTitle>
              <CardDescription>Average days to resolve health issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="text-4xl font-bold">{stats.avgResolutionDays.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Average Days to Resolve</div>
                  <div className="mt-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Resolution Rate:</span>
                      <span className="font-medium">{stats.resolutionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Health issues by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Issues" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>High Severity Issues</CardTitle>
                <CardDescription>Most critical health issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLogs
                    .filter(log => log.severity === 'high' && !log.resolved)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(log => {
                      const reptile = reptiles.find(r => r.id === log.reptile_id);
                      const category = categories.find(c => c.id === log.category_id);
                      return (
                        <div key={log.id} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{reptile?.name || 'Unknown Reptile'}</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(log.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="text-sm">{category?.label || 'Unknown Category'}</div>
                          <div className="text-xs text-gray-500 mt-1">{log.notes || 'No notes'}</div>
                        </div>
                      );
                    })}
                  {filteredLogs.filter(log => log.severity === 'high' && !log.resolved).length === 0 && (
                    <div className="text-center text-gray-500 py-4">No active high severity issues</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Resolutions</CardTitle>
                <CardDescription>Recently resolved health issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLogs
                    .filter(log => log.resolved)
                    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
                    .slice(0, 5)
                    .map(log => {
                      const reptile = reptiles.find(r => r.id === log.reptile_id);
                      const category = categories.find(c => c.id === log.category_id);
                      return (
                        <div key={log.id} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">{reptile?.name || 'Unknown Reptile'}</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(log.updated_at || log.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="text-sm">{category?.label || 'Unknown Category'}</div>
                          <div className="text-xs text-gray-500 mt-1">{log.notes || 'No notes'}</div>
                        </div>
                      );
                    })}
                  {filteredLogs.filter(log => log.resolved).length === 0 && (
                    <div className="text-center text-gray-500 py-4">No resolved issues</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 