'use client';

import { BreedingStats } from '@/app/api/breeding/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Egg,  EggOff, Layers, Turtle } from 'lucide-react';

// Import recharts components
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// Chart colors
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface PayloadType {
  name: string;
  value: number;
  payload: {
    parent: Array<{ name: string; value: number }>;
  };
  color ?: string;
}

// Custom tooltips for charts
const ProjectStatusTooltip = ({ 
  active, 
  payload 
}: {
  active?: boolean;
  payload?: PayloadType[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const parentData = data.payload.parent;
    const total = parentData.reduce((sum: number, item) => sum + item.value, 0);
    const percentage = (data.value / total) * 100;

    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-foreground/90">{data.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Projects: {data.value}</span>
            <span>•</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const EggStatisticsTooltip = ({ 
  active, 
  payload 
}: {
  active?: boolean;
  payload?: PayloadType[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const parentData = data.payload.parent;
    const total = parentData.reduce((sum: number, item) => sum + item.value, 0);
    const percentage = (data.value / total) * 100;

    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-foreground/90">{data.name} Eggs</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Count: {data.value}</span>
            <span>•</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const MonthlyTrendsTooltip = ({ 
  active, 
  payload, 
  label 
}: {
  active?: boolean;
  payload?: PayloadType[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-foreground/90">{label}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-3 h-3 rounded-full" style={{backgroundColor: payload[0].color}} />
            <span>Fertility Rate: {payload[0].value}%</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const HatchRateTooltip = ({ 
  active, 
  payload, 
  label 
}: {
  active?: boolean;
  payload?: PayloadType[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-2">
          <p className="font-medium text-foreground/90">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full" style={{backgroundColor: payload[0].color}} />
              <span>Hatch Rate: {payload[0].value}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full" style={{backgroundColor: payload[1].color}} />
              <span>Clutches: {payload[1].value}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const SpeciesDistributionTooltip = ({ 
  active, 
  payload, 
  label 
}: {
  active?: boolean;
  payload?: PayloadType[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-foreground/90">{label}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-3 h-3 rounded-full" style={{backgroundColor: payload[0].color}} />
            <span>Projects: {payload[0].value}</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
};

interface BreedingStatisticsProps {
  data?: BreedingStats;
}

export function BreedingStatistics({ data }: BreedingStatisticsProps) {
  const screen = useScreenSize()
  if (!data) {
    return <div>No statistics available.</div>;
  }
  
  // Format data for charts
  const projectStatusData = [
    {
      name: 'Active',
      value: data.activeProjects,
      color: CHART_COLORS[1]
    },
    {
      name: 'Completed',
      value: data.completedProjects,
      color: CHART_COLORS[0]
    },
    {
      name: 'Other',
      value: data.totalProjects - data.activeProjects - data.completedProjects,
      color: CHART_COLORS[5]
    },
  ].filter(item => item.value > 0);
  
  const eggStatistics = [
    {
      name: 'Fertile',
      value: data.totalFertileEggs,
      color: CHART_COLORS[1]
    },
    {
      name: 'Infertile',
      value: data.totalEggs - data.totalFertileEggs,
      color: CHART_COLORS[3]
    },
  ];
  
  const fertileRateChart = data.fertileRateByMonth.map(item => ({
    month: item.month,
    rate: item.fertile_rate,
  }));
  
  const hatchRateBySpecies = data.hatchRateBySpecies
    .sort((a, b) => b.hatch_rate - a.hatch_rate)
    .map(item => ({
      name: item.species_name,
      rate: item.hatch_rate,
      clutches: item.total_clutches,
    }));
  
  const projectsBySpecies = data.projectsBySpecies
    .sort((a, b) => b.count - a.count)
    .map(item => ({
      name: item.species_name,
      count: item.count,
    }));
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeProjects} active, {data.completedProjects} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clutches</CardTitle>
            <Egg className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClutches}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalEggs} eggs, {data.totalFertileEggs} fertile
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hatchlings</CardTitle>
            <Turtle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHatchlings}</div>
            <p className="text-xs text-muted-foreground">
              {data.successRate}% success rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fertility Rate</CardTitle>
            <EggOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalEggs > 0 
                ? Math.round((data.totalFertileEggs / data.totalEggs) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalFertileEggs} of {data.totalEggs} eggs fertile
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of breeding projects by status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData.map(item => ({
                    ...item,
                    parent: projectStatusData
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--foreground)'
                  }}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ProjectStatusTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '13px',
                    color: 'var(--foreground)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Egg Fertility</CardTitle>
            <CardDescription>Proportion of fertile vs infertile eggs</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eggStatistics.map(item => ({
                    ...item,
                    parent: eggStatistics
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--foreground)'
                  }}
                >
                  {eggStatistics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<EggStatisticsTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '13px',
                    color: 'var(--foreground)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Projects by Species</CardTitle>
            <CardDescription>Distribution of breeding projects across species</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={projectsBySpecies} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                maxBarSize={screen === 'mobile' ? 10 : 25}
                className="[&>svg>path]:fill-transparent"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" style={{ fontSize: '12px' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={60} 
                  style={{ fontSize: '11px' }}
                />
                <Tooltip content={<SpeciesDistributionTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Projects" 
                  fill={CHART_COLORS[0]} 
                  radius={[0, 4, 4, 0]}
                  
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fertility Rates</CardTitle>
            <CardDescription>Trends in egg fertility over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={fertileRateChart}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  style={{ fontSize: '12px' }}
                  label={{ 
                    value: '%', 
                    position: 'insideLeft',
                    offset: 0,
                    style: { 
                      textAnchor: 'middle',
                      fontSize: '12px',
                      fill: 'var(--muted-foreground)' 
                    }
                  }}
                  width={screen === 'mobile' ? 25 : 40}
                />
                <Tooltip content={<MonthlyTrendsTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  name="Fertility Rate" 
                  stroke={CHART_COLORS[0]} 
                  fill={CHART_COLORS[0]}
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Hatch Rate by Species</CardTitle>
          <CardDescription>Success rate for different species</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hatchRateBySpecies}
              margin={{ top: 10, right: 30, left: screen === 'mobile' ? 0 : 20, bottom: 40 }}
              maxBarSize={screen === 'mobile' ? 10 : 25}
              className="[&>svg>path]:fill-transparent"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis 
                style={{ fontSize: '12px' }}
                width={screen === 'mobile' ? 20 : 40}
              />
              <Tooltip content={<HatchRateTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '13px',
                  color: 'var(--foreground)' 
                }}
              />
              <Bar dataKey="rate" name="Hatch Rate (%)" fill={CHART_COLORS[1]} />
              <Bar dataKey="clutches" name="Clutches" fill={CHART_COLORS[5]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 