import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MonthlyTrendsTooltip } from './CustomTooltips'

interface MonthlyTrendsProps {
  monthlyTrends: {
    month: string;
    total: number;
    active: number;
    resolved: number;
  }[];
}
const MonthlyTrends = ({monthlyTrends} : MonthlyTrendsProps) => {
  return (

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
          <CartesianGrid strokeDasharray="3 3"
          stroke="var(--color-border)"
          />
          <XAxis dataKey="month" style={{ fontSize: '12px' }} />
          <YAxis style={{ fontSize: '12px' }}/>
          <Tooltip content={<MonthlyTrendsTooltip />} />
          <Legend 
            wrapperStyle={{ 
                fontSize: '13px',
                color: 'var(--foreground)' 
              }}
            />
          <Line type="monotone" dataKey="total" name="Total Issues" stroke="#8884d8" />
          <Line type="monotone" dataKey="active" name="Active Issues" stroke="#FF8042" />
          <Line type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#00C49F" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
                   
  )
}

export default MonthlyTrends