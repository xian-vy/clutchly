'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesSummary } from "@/lib/types/sales";
import { format } from "date-fns";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts";
import { TimePeriod } from "../TimeRangeSelector";

interface SalesByTimeChartProps {
  data: SalesSummary | undefined;
  period: TimePeriod;
}

export function SalesByTimeChart({ data, period }: SalesByTimeChartProps) {
  // Chart title based on period
  const chartTitle = useMemo(() => {
    switch (period) {
      case 'weekly': return 'Weekly Sales';
      case 'monthly': return 'Monthly Sales';
      case 'quarterly': return 'Quarterly Sales';
      case 'yearly': return 'Yearly Sales';
      default: return 'Sales Over Time';
    }
  }, [period]);

  // Process data based on selected period
  const chartData = useMemo(() => {
    if (!data || !data.monthly_sales || data.monthly_sales.length === 0) {
      return [];
    }
    
    // Start with the original monthly data
    const monthlySales = [...data.monthly_sales];
    
    // Sort by date
    monthlySales.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    
    switch (period) {
      case 'weekly':
        // For weekly, we'll use the most recent 12 weeks from monthly data
        // This is an approximation since we only have monthly data
        return monthlySales
          .slice(-12)
          .map((item, index) => {
            // Divide monthly data into roughly weekly chunks
            const weekNumber = index % 4 + 1;
            const monthDate = new Date(item.month);
            return {
              ...item,
              period: `W${weekNumber} ${format(monthDate, 'MMM yy')}`,
              count: Math.round(item.count / 4), // Approximate weekly sales
              revenue: Math.round((item.revenue / 4) * 100) / 100, // Approximate weekly revenue
            };
          });
        
      case 'monthly':
        // Use the original monthly data
        return monthlySales
          .map(item => ({
            ...item,
            period: format(new Date(item.month), 'MMM yy'),
          }));
        
      case 'quarterly':
        // Group data by quarters
        const quarterlyData: Record<string, { count: number; revenue: number }> = {};
        
        monthlySales.forEach(item => {
          const date = new Date(item.month);
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          const year = date.getFullYear();
          const key = `Q${quarter} ${year}`;
          
          if (!quarterlyData[key]) {
            quarterlyData[key] = { count: 0, revenue: 0 };
          }
          
          quarterlyData[key].count += item.count;
          quarterlyData[key].revenue += item.revenue;
        });
        
        return Object.entries(quarterlyData)
          .map(([key, value]) => ({
            period: key,
            count: value.count,
            revenue: value.revenue,
          }))
          .sort((a, b) => {
            // Sort by year and quarter
            const [q1, y1] = a.period.split(' ');
            const [q2, y2] = b.period.split(' ');
            return y1 === y2 
              ? q1.localeCompare(q2) 
              : Number(y1) - Number(y2);
          });
        
      case 'yearly':
        // Group data by years
        const yearlyData: Record<string, { count: number; revenue: number }> = {};
        
        monthlySales.forEach(item => {
          const year = new Date(item.month).getFullYear().toString();
          
          if (!yearlyData[year]) {
            yearlyData[year] = { count: 0, revenue: 0 };
          }
          
          yearlyData[year].count += item.count;
          yearlyData[year].revenue += item.revenue;
        });
        
        return Object.entries(yearlyData)
          .map(([year, value]) => ({
            period: year,
            count: value.count,
            revenue: value.revenue,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));
        
      default:
        return monthlySales.map(item => ({
          ...item,
          period: format(new Date(item.month), 'MMM yy'),
        }));
    }
  }, [data, period]);

  // If data is empty or not provided
  if (!data || !data.monthly_sales || data.monthly_sales.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No sales data available for the selected period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>Number of sales and revenue by {period} period</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            maxBarSize={25}
            className="[&>svg>path]:fill-transparent"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="period" 
              fontSize={12} 
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="var(--color-chart-2)"
              label={{
                value: 'Revenue ($)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'var(--color-muted-foreground)' }
              }}
              fontSize={12}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--color-chart-1)"
              fontSize={12}
              label={{
                value: 'Number of Sales',
                angle: 90,
                position: 'insideRight',
                style: { fill: 'var(--color-muted-foreground)' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                if (name === 'count') return [value, 'Number of Sales'];
                return [value, name];
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === 'revenue') return 'Revenue ($)';
                if (value === 'count') return 'Number of Sales';
                return value;
              }}
              wrapperStyle={{
                fontSize: '13px',
                color: 'var(--foreground)'
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="var(--color-chart-2)"
              name="revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-chart-1)' }}
              activeDot={{ r: 6, fill: 'var(--color-chart-1)' }}
              name="count"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 