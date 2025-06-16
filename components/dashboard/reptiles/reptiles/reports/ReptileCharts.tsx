'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReptileReportData } from '@/app/api/reptiles/reports';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area
} from 'recharts';
import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { formatChartAmount, formatPrice, getSpeciesAbbreviation } from '@/lib/utils';

interface ReptileChartsProps {
  data: ReptileReportData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82CA9D'];
const STATUS_COLORS = {
  active: '#00C49F',
  sold: '#FFBB28',
  deceased: '#FF8042',
  unknown: '#8884d8'
};

export function ReptileCharts({ data }: ReptileChartsProps) {
  const screen = useScreenSize();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Species Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Species Distribution</CardTitle>
          <CardDescription>Distribution of reptiles by species ({data.speciesDistribution.length} unique species)</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.speciesDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={3}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                style={{
                  fontSize: '13px',
                  color: 'var(--foreground)'
                }}
              >
                {data.speciesDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'count') return [`${value} reptiles`, 'Count'];
                  if (name === 'value') return [`$${value.toFixed(2)}`, 'Value'];
                  return [value, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Value Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Value Distribution</CardTitle>
          <CardDescription>Distribution of collection value by species</CardDescription>
        </CardHeader>
        <CardContent className="h-72 px-0 2xl:pl-2 2xl:pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data.speciesDistribution}
              margin={{
                top: screen === 'mobile' ? 10 : 20,
                right: screen === 'mobile' ? 0 : 30,
                left: screen === 'mobile' ? 0 : 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                fontSize={screen === 'mobile' ? 10 : 12}
                textAnchor="end"
                height={60}
                tickFormatter={getSpeciesAbbreviation}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="var(--color-chart-1)"
                label={{
                  value: 'Value ($)',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: screen === 'mobile' ? 10 : 13,
                  style: { fill: 'var(--color-muted-foreground)', display: screen === 'mobile' ? 'none' : 'block' }
                }}
                fontSize={screen === 'mobile' ? 10 : 12}
                tickFormatter={formatChartAmount}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--color-chart-2)"
                fontSize={screen === 'mobile' ? 10 : 12}
                label={{
                  value: 'Number of Reptiles',
                  fontSize: screen === 'mobile' ? 10 : 13,
                  angle: 90,
                  position: 'insideRight',
                  style: { fill: 'var(--color-muted-foreground)', display: screen === 'mobile' ? 'none' : 'block' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'value') return [`${formatPrice(value)}`, 'Value'];
                  if (name === 'count') return [value, 'Number of Reptiles'];
                  return [value, name];
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === 'value') return 'Value ($)';
                  if (value === 'count') return 'Number of Reptiles';
                  return value;
                }}
                wrapperStyle={{
                  fontSize: screen === 'mobile' ? '10px' : '13px',
                  color: 'var(--foreground)',
                }}
              />
              <defs>
                <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="count"
                name="count"
                stroke="var(--color-chart-2)"
                fill="url(#countGradient)"
                fillOpacity={0.2}
                strokeWidth={1.5}
                yAxisId="right"
              />
              <Bar
                yAxisId="left"
                dataKey="value"
                fill="var(--color-chart-1)"
                name="value"
                maxBarSize={25}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Distribution of reptiles by status</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={3}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
                label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                style={{
                  fontSize: '13px',
                  color: 'var(--foreground)'
                }}
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} reptiles`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>Distribution of reptiles by age range</CardDescription>
        </CardHeader>
        <CardContent className="h-72 px-0 2xl:pl-2 2xl:pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.ageDistribution}
              margin={{
                top: screen === 'mobile' ? 10 : 20,
                right: screen === 'mobile' ? 0 : 30,
                left: screen === 'mobile' ? 0 : 20,
                bottom: 5,
              }}
              maxBarSize={screen === 'mobile' ? 10 : 25}
              className="[&>svg>path]:fill-transparent"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="range" 
                fontSize={screen === 'mobile' ? 10 : 12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                fontSize={screen === 'mobile' ? 10 : 12}
                label={{
                  value: 'Number of Reptiles',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: screen === 'mobile' ? 10 : 13,
                  style: { fill: 'var(--color-muted-foreground)', display: screen === 'mobile' ? 'none' : 'block' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 