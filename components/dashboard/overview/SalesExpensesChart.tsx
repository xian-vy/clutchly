'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { ExpensesSummary } from "@/lib/types/expenses";
import { SalesSummary } from "@/lib/types/sales";
import { formatChartAmount } from "@/lib/utils";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  TooltipProps,
} from "recharts";

type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

interface ChartDataItem {
  period: string;
  sales: number;
  expenses: number;
  profit: number;
  periodStartDate?: Date;
  periodEndDate?: Date;
}

interface SalesExpensesChartProps {
  salesSummary: SalesSummary | undefined;
  expensesSummary: ExpensesSummary | undefined;
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md text-sm">
        <h5 className="font-semibold mb-2">{label}</h5>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name === 'sales' ? 'Sales' : entry.name === 'expenses' ? 'Expenses' : 'Profit'}</span>
              </div>
              <span className="font-medium">
                ${Number(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
          {payload.length > 1 && (
            <div className="pt-1 mt-1 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Net Profit</span>
                <span className={`font-semibold ${Number(payload[0].value) - Number(payload[1].value) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${(Number(payload[0].value) - Number(payload[1].value)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function SalesExpensesChart({ 
  salesSummary, 
  expensesSummary, 
  period, 
  startDate, 
  endDate 
}: SalesExpensesChartProps) {
  const screen = useScreenSize();
  // Chart title based on period
  const chartTitle = useMemo(() => {
    switch (period) {
      case 'weekly': return 'Weekly Sales vs Expenses';
      case 'monthly': return 'Monthly Sales vs Expenses';
      case 'quarterly': return 'Quarterly Sales vs Expenses';
      case 'yearly': return 'Yearly Sales vs Expenses';
      case 'custom': return 'Sales vs Expenses';
      default: return 'Sales vs Expenses';
    }
  }, [period]);

  // Process and combine sales and expenses data
  const chartData = useMemo((): ChartDataItem[] => {
    if (!salesSummary && !expensesSummary) {
      return [];
    }

    // Create a map to store combined data by period
    const combinedDataMap = new Map<string, ChartDataItem>();
    
    // For monthly view, ensure we always have 12 months in Jan-Dec order
    if (period === 'monthly') {
      const currentYear = new Date().getFullYear();
      // Create data for all 12 months of the current year in order
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(currentYear, month, 1);
        const periodKey = format(monthDate, 'yyyy-MM');
        const periodLabel = format(monthDate, 'MMM yy');
        const periodStartDate = new Date(currentYear, month, 1);
        const periodEndDate = new Date(currentYear, month + 1, 0);

        combinedDataMap.set(periodKey, {
          period: periodLabel,
          sales: 0,
          expenses: 0,
          profit: 0,
          periodStartDate,
          periodEndDate
        });
      }
    }
    
    // Process sales data
    if (salesSummary?.monthly_sales) {
      salesSummary.monthly_sales.forEach(item => {
        const monthDate = parseISO(item.month);
        let periodKey = '';
        let periodLabel = '';
        let periodStartDate: Date | undefined;
        let periodEndDate: Date | undefined;
        
        switch (period) {
          case 'weekly':
            // For weekly, we'll approximate by creating weeks from the month
            // This is simplified as we don't have actual weekly data
            // In a real app, you'd fetch proper weekly data from the API
            for (let week = 0; week < 4; week++) {
              const weekStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), week * 7 + 1);
              const weekEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), (week + 1) * 7);
              
              periodKey = `W${week + 1}-${format(monthDate, 'yyyy-MM')}`;
              periodLabel = `W${week + 1} ${format(monthDate, 'MMM yy')}`;
              
              // Add with approximate values (dividing monthly data)
              if (!combinedDataMap.has(periodKey)) {
                combinedDataMap.set(periodKey, {
                  period: periodLabel,
                  sales: Math.round((item.revenue / 4) * 100) / 100,
                  expenses: 0,
                  profit: Math.round((item.revenue / 4) * 100) / 100,
                  periodStartDate: weekStart,
                  periodEndDate: weekEnd
                });
              } else {
                const existing = combinedDataMap.get(periodKey)!;
                existing.sales += Math.round((item.revenue / 4) * 100) / 100;
                existing.profit = existing.sales - existing.expenses;
              }
            }
            break;
            
          case 'monthly':
            periodKey = item.month;
            periodLabel = format(monthDate, 'MMM yy');
            periodStartDate = startOfMonth(monthDate);
            periodEndDate = endOfMonth(monthDate);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: item.revenue,
                expenses: 0,
                profit: item.revenue,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.sales = item.revenue;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
            
          case 'quarterly':
            const quarter = Math.floor(monthDate.getMonth() / 3) + 1;
            const year = monthDate.getFullYear();
            periodKey = `Q${quarter}-${year}`;
            periodLabel = `Q${quarter} ${year}`;
            periodStartDate = new Date(year, (quarter - 1) * 3, 1);
            periodEndDate = new Date(year, quarter * 3, 0);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: item.revenue,
                expenses: 0,
                profit: item.revenue,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.sales += item.revenue;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
            
          case 'yearly':
            const yearKey = monthDate.getFullYear().toString();
            periodKey = yearKey;
            periodLabel = yearKey;
            periodStartDate = new Date(parseInt(yearKey), 0, 1);
            periodEndDate = new Date(parseInt(yearKey), 11, 31);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: item.revenue,
                expenses: 0,
                profit: item.revenue,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.sales += item.revenue;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
            
          case 'custom':
          default:
            // For custom, we use monthly data as is
            periodKey = item.month;
            periodLabel = format(monthDate, 'MMM yy');
            periodStartDate = startOfMonth(monthDate);
            periodEndDate = endOfMonth(monthDate);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: item.revenue,
                expenses: 0,
                profit: item.revenue,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.sales = item.revenue;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
        }
      });
    }
    
    // Process expenses data
    if (expensesSummary?.monthlyExpenses) {
      Object.entries(expensesSummary.monthlyExpenses).forEach(([month, amount]) => {
        const monthDate = parseISO(month);
        let periodKey = '';
        let periodLabel = '';
        let periodStartDate: Date | undefined;
        let periodEndDate: Date | undefined;
        
        switch (period) {
          case 'weekly':
            // Similar approximation as with sales
            for (let week = 0; week < 4; week++) {
              const weekStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), week * 7 + 1);
              const weekEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), (week + 1) * 7);
              
              periodKey = `W${week + 1}-${format(monthDate, 'yyyy-MM')}`;
              periodLabel = `W${week + 1} ${format(monthDate, 'MMM yy')}`;
              
              if (!combinedDataMap.has(periodKey)) {
                combinedDataMap.set(periodKey, {
                  period: periodLabel,
                  sales: 0,
                  expenses: Math.round((amount / 4) * 100) / 100,
                  profit: -Math.round((amount / 4) * 100) / 100,
                  periodStartDate: weekStart,
                  periodEndDate: weekEnd
                });
              } else {
                const existing = combinedDataMap.get(periodKey)!;
                existing.expenses += Math.round((amount / 4) * 100) / 100;
                existing.profit = existing.sales - existing.expenses;
              }
            }
            break;
            
          case 'monthly':
            periodKey = month;
            periodLabel = format(monthDate, 'MMM yy');
            periodStartDate = startOfMonth(monthDate);
            periodEndDate = endOfMonth(monthDate);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: 0,
                expenses: amount,
                profit: -amount,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.expenses = amount;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
            
          case 'quarterly':
            const quarter = Math.floor(monthDate.getMonth() / 3) + 1;
            const year = monthDate.getFullYear();
            periodKey = `Q${quarter}-${year}`;
            periodLabel = `Q${quarter} ${year}`;
            periodStartDate = new Date(year, (quarter - 1) * 3, 1);
            periodEndDate = new Date(year, quarter * 3, 0);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: 0,
                expenses: amount,
                profit: -amount,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.expenses += amount;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
            
          case 'yearly':
            const yearKey = monthDate.getFullYear().toString();
            periodKey = yearKey;
            periodLabel = yearKey;
            periodStartDate = new Date(parseInt(yearKey), 0, 1);
            periodEndDate = new Date(parseInt(yearKey), 11, 31);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: 0,
                expenses: amount,
                profit: -amount,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.expenses += amount;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
            
          case 'custom':
          default:
            periodKey = month;
            periodLabel = format(monthDate, 'MMM yy');
            periodStartDate = startOfMonth(monthDate);
            periodEndDate = endOfMonth(monthDate);
            
            if (!combinedDataMap.has(periodKey)) {
              combinedDataMap.set(periodKey, {
                period: periodLabel,
                sales: 0,
                expenses: amount,
                profit: -amount,
                periodStartDate,
                periodEndDate
              });
            } else {
              const existing = combinedDataMap.get(periodKey)!;
              existing.expenses = amount;
              existing.profit = existing.sales - existing.expenses;
            }
            break;
        }
      });
    }

    // Filter data if custom date range is provided
    let resultData = Array.from(combinedDataMap.values());
    
    if (period === 'custom' && startDate && endDate) {
      resultData = resultData.filter(item => {
        if (!item.periodStartDate || !item.periodEndDate) return true;
        return (
          (item.periodStartDate >= startDate && item.periodStartDate <= endDate) ||
          (item.periodEndDate >= startDate && item.periodEndDate <= endDate) ||
          (item.periodStartDate <= startDate && item.periodEndDate >= endDate)
        );
      });
    }
    
    // Sort data by period
    return resultData.sort((a, b) => {
      if (a.periodStartDate && b.periodStartDate) {
        return a.periodStartDate.getTime() - b.periodStartDate.getTime();
      }
      return a.period.localeCompare(b.period);
    });
  }, [salesSummary, expensesSummary, period, startDate, endDate]);

  // If data is empty
  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Sales vs Expenses</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No financial data available for the selected period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>Sales vs Expenses comparison by {period} period</CardDescription>
      </CardHeader>
      <CardContent className="h-80 px-0 2xl:pl-2 2xl:pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: screen === 'mobile' ? 10: 20,
              right: screen === 'mobile' ?  20: 30,
              left: screen === 'mobile' ? 0 : 20,
              bottom: 5,
            }}
            className="[&>svg>path]:fill-transparent"
            maxBarSize={25}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="period" 
              fontSize={screen === 'mobile' ? 10 : 12} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              fontSize={screen === 'mobile' ? 10 : 12}
              stroke="var(--color-chart-1)"
              width={40}
              tickFormatter={formatChartAmount}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                if (value === 'sales') return 'Sales';
                if (value === 'expenses') return 'Expenses';
                if (value === 'profit') return 'Profit';
                return value;
              }}
              wrapperStyle={{
                fontSize: '13px',
                color: 'var(--foreground)'
              }}
            />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                <stop offset="50%" stopColor="var(--color-chart-1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-6)" stopOpacity={0.5} />
                <stop offset="50%" stopColor="var(--color-chart-6)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          
            <Area 
              type="monotone" 
              dataKey="expenses"
              stroke="var(--color-chart-6)"
              fill="url(#expensesGradient)"
              strokeWidth={1.5}
              connectNulls={true}
              scale="point"
            />
              <Area 
              type="monotone" 
              dataKey="sales"
              stroke="var(--color-chart-1)"
              fill="url(#salesGradient)"
              strokeWidth={1.5}
              connectNulls={true}
              scale="point"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 