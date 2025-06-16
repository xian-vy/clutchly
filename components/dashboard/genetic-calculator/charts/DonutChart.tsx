'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-8)'
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-md border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-foreground">{label || payload[0].name}</p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <span>Probability: {(payload[0].value * 100).toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  return null
}

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export const DonutChart = ({ data }: DonutChartProps) => {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            stroke="none" 
            innerRadius={60}
            paddingAngle={2}
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            style={{
              fontSize: '13px',
              color: 'var(--foreground)'
            }}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
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
  )
}