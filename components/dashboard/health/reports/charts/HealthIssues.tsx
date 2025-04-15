import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { HealthIssuesToolTip } from './CustomTooltips'
interface HealthIssuesProps {
    reptileHealthData : {
      name: string;
      active: number;
      total: number;
      resolved: number;
    }[];
}
const HealthIssues = ({reptileHealthData} : HealthIssuesProps) => {
  return (
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
                  maxBarSize={25}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3"
                   stroke="var(--color-border)"
                   />
                  <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip content={<HealthIssuesToolTip />} />
                  <Legend 
                   wrapperStyle={{ 
                    fontSize: '13px',
                    color: 'var(--foreground)' 
                  }}
                  />
                  <Bar dataKey="active" name="Active Issues" fill="#FF8042" />
                  <Bar dataKey="resolved" name="Resolved Issues" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
  )
}

export default HealthIssues