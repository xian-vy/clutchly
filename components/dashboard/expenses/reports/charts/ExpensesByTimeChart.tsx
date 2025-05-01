'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { TimePeriod } from '../TimeRangeSelector';
import { formatCurrency } from '@/lib/utils';

interface ExpensesByTimeChartProps {
  data: {
    expense_date: string;
    amount: number;
  }[];
  timePeriod: TimePeriod;
}

export function ExpensesByTimeChart({ data, timePeriod }: ExpensesByTimeChartProps) {
  // Transform the data to have a 'date' property instead of 'expense_date'
  const transformedData = data.map(item => ({
    ...item,
    date: item.expense_date
  }));

  const formatDate = (dateString: string) => {
    try {
      // Try to parse as ISO string first (YYYY-MM-DD or similar)
      let date: Date;
      
      if (typeof dateString === 'string' && dateString.trim() !== '') {
        // Attempt to parse as ISO date
        date = parseISO(dateString);
        
        // If not valid, try with regular Date constructor
        if (!isValid(date)) {
          date = new Date(dateString);
        }
        
        // If still not valid, throw error
        if (!isValid(date)) {
          console.error('Invalid date:', dateString);
          return 'Invalid';
        }
        
        // Format based on time period
        switch (timePeriod) {
          case 'daily':
            return format(date, 'MMM d');
          case 'weekly':
            return format(date, 'MMM d');
          case 'monthly':
            return format(date, 'MMM yyyy');
          case 'yearly':
            return format(date, 'yyyy');
          default:
            return format(date, 'MMM d');
        }
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error, 'for dateString:', dateString);
      return 'N/A';
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses Over Time</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No expense data available for the selected period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses Over Time</CardTitle>
        <CardDescription>Trends in expenses over the {timePeriod} period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const formattedDate = formatDate(payload[0].payload.date);
                    const amount = typeof payload[0].value === 'number' 
                      ? formatCurrency(payload[0].value) 
                      : 'N/A';
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {formattedDate}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Amount
                            </span>
                            <span className="font-bold">
                              {amount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 