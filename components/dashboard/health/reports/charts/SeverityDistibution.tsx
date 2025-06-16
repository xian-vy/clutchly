import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CHART_COLORS, CustomTooltip } from './CustomTooltips'

interface AnalysisTabProps {
  severityData: { name: string; value: number }[]
}
const SeverityDistibution = ({severityData} : AnalysisTabProps) => {
  return (
    <Card>
    <CardHeader>
      <CardTitle>Severity Distribution</CardTitle>
      <CardDescription>Breakdown of health issues by severity</CardDescription>
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={severityData.map(item => ({
              ...item,
              parent: severityData
            }))}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={2}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            style={{
              fontSize: '13px',
              color: 'var(--foreground)'
            }}
          >
            {severityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend      
          wrapperStyle={{ 
              fontSize: '13px',
              color: 'var(--foreground)' 
            }}/>
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  
  )
}

export default SeverityDistibution