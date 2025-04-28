'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Legend,
  ComposedChart,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getSalesSummary } from '@/app/api/sales';
import { useQuery } from '@tanstack/react-query';

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  pending: '#FFBB28',
  completed: '#00C49F',
  cancelled: '#FF8042',
  refunded: '#0088FE',
};

export function SalesReportTab() {

  const { 
    data: salesSummary, 
    isLoading 
  } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: async () => getSalesSummary(),
  });
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!salesSummary) {
    return (
      <div className="text-center py-12">
        <p>No sales data available</p>
      </div>
    );
  }

  // Prepare data for the status pie chart
  const statusData = Object.entries(salesSummary.sales_by_status).map(([key, value]) => ({
    name: key,
    value,
  }));

  // Prepare data for the payment method pie chart
  const paymentData = Object.entries(salesSummary.sales_by_payment_method).map(([key, value]) => ({
    name: key,
    value,
  })).filter((item) => item.value > 0);

  // Format month names for the monthly sales chart
  const formattedMonthlySales = salesSummary.monthly_sales.map((item) => ({
    ...item,
    month: format(new Date(item.month), 'MMM yy'),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesSummary.total_sales}</div>
            <p className="text-xs text-muted-foreground">Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesSummary.total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesSummary.average_price.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per sale</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Number of sales and revenue by month</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={formattedMonthlySales}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                maxBarSize={25}
                className="[&>svg>path]:fill-transparent"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                <XAxis dataKey="month" fontSize={12} />
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
                  labelFormatter={(label) => format(new Date(label), 'MMMM d, yyyy')}
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

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Status</CardTitle>
            <CardDescription>Distribution of sales by status</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods used</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name.replace('_', ' ')}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 