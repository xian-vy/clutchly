import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {  CustomTooltip } from './CustomTooltips'

interface AnalysisTabProps {
    statusData: { name: string; value: number }[]

}
const StatusDistribution = ({statusData} : AnalysisTabProps) => {
  return (
    <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Breakdown of health issues by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.map(item => ({
                        ...item,
                        parent: statusData
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
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF8042' : '#00C49F'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                         wrapperStyle={{ 
                          fontSize: '13px',
                          color: 'var(--foreground)' 
                        }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
  )
}

export default StatusDistribution