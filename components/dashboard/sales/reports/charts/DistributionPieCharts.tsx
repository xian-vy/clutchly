'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesSummary } from "@/lib/types/sales";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  pending: '#FFBB28',
  completed: '#00C49F',
  cancelled: '#FF8042',
  refunded: '#0088FE',
};

interface DistributionPieChartsProps {
  data: SalesSummary | undefined;
  speciesData?: { name: string; value: number }[];
  morphData?: { name: string; value: number }[];
}

export function DistributionPieCharts({ 
  data, 
  speciesData = [], 
  morphData = [] 
}: DistributionPieChartsProps) {
  if (!data) {
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

  // Prepare data for the status pie chart
  const statusData = Object.entries(data.sales_by_status).map(([key, value]) => ({
    name: key,
    value,
  }));

  // Prepare data for the payment method pie chart
  const paymentData = Object.entries(data.sales_by_payment_method)
    .map(([key, value]) => ({
      name: key,
      value,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Tooltip 
                formatter={(value: number) => [`${value} sales`, 'Count']}
              />
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
              <Tooltip 
                formatter={(value: number) => [`${value} sales`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Species Distribution */}
      {speciesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales by Species</CardTitle>
            <CardDescription>Distribution of sales by reptile species</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} sales`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Morph Distribution */}
      {morphData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales by Morph</CardTitle>
            <CardDescription>Distribution of sales by reptile morphs</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={morphData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => 
                    `${name.length > 15 ? name.substring(0, 12) + '...' : name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {morphData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} sales`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 