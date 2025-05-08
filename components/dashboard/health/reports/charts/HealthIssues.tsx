import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { HealthIssuesToolTip } from './CustomTooltips'
import { useScreenSize } from '@/lib/hooks/useScreenSize';
interface HealthIssuesProps {
    reptileHealthData : {
      name: string;
      active: number;
      total: number;
      resolved: number;
    }[];
}
const HealthIssues = ({reptileHealthData} : HealthIssuesProps) => {
  const screen = useScreenSize();
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
                  margin={{ top: 20, right: 30, left: screen === 'mobile' ? 0 : 20, bottom: 5 }}
                  maxBarSize={screen === 'mobile' ? 10 : 25}
                  className="[&>svg>path]:fill-transparent"
                >
                  <CartesianGrid 
                    strokeDasharray="3 3"
                   stroke="var(--color-border)"
                   />
                  <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} width={screen === 'mobile' ? 20 : 40}/>
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