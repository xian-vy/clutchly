import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CategoryTooltip } from './CustomTooltips'
interface CategoryDistributionProps {
    categoryDistribution: { name: string; count: number }[];
}
const CategoryDistribution = ({categoryDistribution} : CategoryDistributionProps) => {
  return (
    <Card>
    <CardHeader>
      <CardTitle>Category Distribution</CardTitle>
      <CardDescription>Health issues by category</CardDescription>
    </CardHeader>
    <CardContent className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={categoryDistribution}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
          className="[&>svg>path]:fill-transparent"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" style={{ fontSize: '12px' }} />
          <YAxis dataKey="name" type="category" width={150}  style={{ fontSize: '13px' }}/>
          <Tooltip content={<CategoryTooltip />} />
          <Legend 
             wrapperStyle={{ 
              fontSize: '13px',
              color: 'var(--foreground)' 
            }}
            />
          <Bar dataKey="count" name="Number of Issues" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  )
}

export default CategoryDistribution