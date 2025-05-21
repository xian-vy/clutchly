'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useScreenSize } from '@/lib/hooks/useScreenSize'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'

interface ChartData {
  date: string
  interval?: number
  completeness?: string
  completenessValue?: number
}

interface SheddingChartsProps {
  intervalData: ChartData[]
  completenessData: ChartData[]
  selectedMetric: 'intervals' | 'completeness'
  onMetricChange: (metric: 'intervals' | 'completeness') => void
}

export function SheddingCharts({ 
  intervalData, 
  completenessData, 
  selectedMetric, 
  onMetricChange 
}: SheddingChartsProps) {
  const screen = useScreenSize()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Shedding Progress</CardTitle>
          <CardDescription>Track shedding intervals and completeness over time</CardDescription>
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={selectedMetric}
          onChange={(e) => onMetricChange(e.target.value as 'intervals' | 'completeness')}
        >
          <option value="intervals">Shedding Intervals</option>
          <option value="completeness">Shedding Completeness</option>
        </select>
      </CardHeader>
      <CardContent className="px-0 2xl:pl-2 2xl:pr-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'intervals' ? (
              <LineChart
                data={intervalData}
                margin={{
                  top: 5,
                  right: screen === 'mobile' ? 0 : 30,
                  left: screen === 'mobile' ? 0 : 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={screen === 'mobile' ? 10 : 12}
                />
                <YAxis
                  label={{
                    value: 'Days Between Sheds',
                    angle: -90,
                    fontSize: screen === 'mobile' ? 10 : 13,
                    position: 'insideLeft',
                    style: { fill: 'var(--color-muted-foreground)', display: screen === 'mobile' ? 'none' : 'block' }
                  }}
                  stroke="var(--color-chart-1)"
                  fontSize={screen === 'mobile' ? 10 : 12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} days`, 'Interval']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="interval"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--color-chart-1)' }}
                  activeDot={{ r: 6, fill: 'var(--color-chart-1)' }}
                  name="Shedding Interval"
                />
              </LineChart>
            ) : (
              <BarChart
                data={completenessData}
                margin={{
                  top: 5,
                  right: screen === 'mobile' ? 0 : 30,
                  left: screen === 'mobile' ? 0 : 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  fontSize={screen === 'mobile' ? 10 : 12}
                />
                <YAxis
                  label={{
                    value: 'Shedding Completeness',
                    angle: -90,
                    fontSize: screen === 'mobile' ? 10 : 13,
                    position: 'insideLeft',
                    style: { fill: 'var(--color-muted-foreground)', display: screen === 'mobile' ? 'none' : 'block' }
                  }}
                  stroke="var(--color-chart-2)"
                  fontSize={screen === 'mobile' ? 10 : 12}
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                  tickFormatter={(value) => {
                    switch (value) {
                      case 0: return 'Unknown';
                      case 1: return 'Retained';
                      case 2: return 'Partial';
                      case 3: return 'Full';
                      default: return '';
                    }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => {
                    switch (value) {
                      case 0: return ['Unknown', 'Completeness'];
                      case 1: return ['Retained', 'Completeness'];
                      case 2: return ['Partial', 'Completeness'];
                      case 3: return ['Full', 'Completeness'];
                      default: return [value, 'Completeness'];
                    }
                  }}
                />
                <Legend />
                <Bar
                  dataKey="completenessValue"
                  fill="var(--color-chart-2)"
                  name="Shedding Completeness"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 