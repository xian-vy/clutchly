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
  Area,
} from "recharts";
import { TimePeriod } from "../TimeRangeSelector";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { formatChartAmount, formatPrice } from "@/lib/utils";

interface SalesByTimeChartProps {
  data: SalesSummary | undefined;
  period: TimePeriod;
}

export function SalesByTimeChart({ data, period }: SalesByTimeChartProps) {
  const screen = useScreenSize();

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
      <CardContent className="h-80  px-0 2xl:pl-2 2xl:pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: screen === 'mobile' ? 10: 20,
              right: screen === 'mobile' ?  0: 30,
              left: screen === 'mobile' ? 0 : 20,
              bottom: 5,
            }}
            maxBarSize={screen === 'mobile' ? 10 : 25}
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
                fontSize:screen ==='mobile'? 10 : 13,
                style: { fill: 'var(--color-muted-foreground)',display: screen === 'mobile' ? 'none' : 'block' }
              }}
              fontSize={screen === 'mobile' ? 10 : 12}
              tickFormatter={formatChartAmount}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--color-chart-1)"
              fontSize={screen === 'mobile' ? 10 : 12}
              label={{
                value: 'Number of Sales',
                fontSize:screen ==='mobile'? 10 : 13,
                angle: 90,
                position: 'insideRight',
                style: { fill: 'var(--color-muted-foreground)',display: screen === 'mobile' ? 'none' : 'block' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [`${formatPrice(value)}`, 'Revenue'];
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
                fontSize:screen === 'mobile' ? '10px' : '13px',
                color: 'var(--foreground)',
              }}
            />  
              <defs>
               <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.1} />
              </linearGradient>
              </defs>
               <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="count" 
                  stroke="var(--color-chart-2)"
                  fill="url(#countGradient)"
                  fillOpacity={0.2} 
                  strokeWidth={1.5}
                  yAxisId="right"
                />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="var(--color-chart-1)"
              name="revenue"
              radius={[4,4,0,0]}
            />

           
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 