'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, TooltipProps } from 'recharts';
import { ExpenseRecord } from '@/lib/types/expenses';
import { formatCurrency } from '@/lib/utils';
import { TimePeriod } from '../TimeRangeSelector';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Chart colors for consistent styling
const CATEGORY_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C43',
];

interface CategoryItem {
  name: string;
  value: number;
}

interface StatusItem {
  name: string;
  value: number;
}

interface DistributionPieChartsProps {
  data: ExpenseRecord[];
  period: TimePeriod;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            {data.name}
          </span>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color as string }}
            />
            <span className="text-sm">{formatCurrency(data.value as number)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DistributionPieCharts({ data }: DistributionPieChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>No data available</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Group data by category
  const categoryData: CategoryItem[] = Object.entries(
    data.reduce((acc, curr) => {
      const category = curr.category;
      acc[category] = (acc[category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value);

  // Group data by status
  const statusData: StatusItem[] = Object.entries(
    data.reduce((acc, curr) => {
      const status = curr.status;
      acc[status] = (acc[status] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value);

  // Custom formatter for pie chart labels
  const renderLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Distribution of expenses by category</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={3}
                labelLine={true}
                label={renderLabel}
                style={{
                  fontSize: '13px',
                  color: 'var(--foreground)'
                }}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 1000 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Status</CardTitle>
          <CardDescription>Distribution of expenses by status</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={3}
                labelLine={true}
                label={renderLabel}
                style={{
                  fontSize: '13px',
                  color: 'var(--foreground)'
                }}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 1000 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 