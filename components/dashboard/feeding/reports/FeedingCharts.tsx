import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedingReportData } from '@/app/api/feeding/reports';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { useScreenSize } from '@/lib/hooks/useScreenSize';

interface FeedingChartsProps {
  data: FeedingReportData;
}

export function FeedingCharts({ data }: FeedingChartsProps) {
  const screen = useScreenSize();

  // Format dates for the feeding trends chart
  const formattedFeedingTrends = data.feedingTrends.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd')
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Feeding Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-80 px-0 2xl:pl-2 2xl:pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={formattedFeedingTrends}
              margin={{
                top: screen === 'mobile' ? 10 : 20,
                right: screen === 'mobile' ? 0 : 30,
                left: screen === 'mobile' ? 0 : 20,
                bottom: 5,
              }}
              className="[&>svg>path]:fill-transparent"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                fontSize={screen === 'mobile' ? 10 : 12}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="var(--color-chart-2)"
                label={{
                  value: 'Number of Feedings',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: screen === 'mobile' ? 10 : 13,
                  style: { fill: 'var(--color-muted-foreground)', display: screen === 'mobile' ? 'none' : 'block' }
                }}
                fontSize={screen === 'mobile' ? 10 : 12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [value, 'Number of Feedings']}
              />
              <Legend
                wrapperStyle={{
                  fontSize: screen === 'mobile' ? '10px' : '13px',
                  color: 'var(--foreground)',
                }}
              />
              <defs>
                <linearGradient id="feedingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="count"
                name="Feedings"
                stroke="var(--color-chart-2)"
                fill="url(#feedingGradient)"
                fillOpacity={0.2}
                strokeWidth={1.5}
                yAxisId="left"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Most Fed Species</CardTitle>
        </CardHeader>
        <CardContent className="h-80 px-0 2xl:pl-2 2xl:pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.mostFedSpecies}
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
                dataKey="name" 
                fontSize={screen === 'mobile' ? 10 : 12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="left"
                fontSize={screen === 'mobile' ? 10 : 12}
                label={{
                  value: 'Number of Feedings',
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
                formatter={(value: number) => [value, 'Feedings']}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
                yAxisId="left"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card  className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Most Used Food Types</CardTitle>
        </CardHeader>
        <CardContent className="h-80 px-0 2xl:pl-2 2xl:pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.mostUsedFoodTypes}
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
                dataKey="name" 
                fontSize={screen === 'mobile' ? 10 : 12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="left"
                fontSize={screen === 'mobile' ? 10 : 12}
                label={{
                  value: 'Number of Uses',
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
                formatter={(value: number) => [value, 'Uses']}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
                yAxisId="left"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 