'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { GrowthEntry } from "@/lib/types/growth";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  Tooltip as RechartsTooltip
} from 'recharts';
import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
import { formatChartAmount } from "@/lib/utils";
interface GrowthTabProps {
  reptileDetails: DetailedReptile | null;
}
export function GrowthTab({ reptileDetails }: GrowthTabProps) {
  if (!reptileDetails) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  const displayGrowthData = (growthHistory: GrowthEntry[]) => {
    if (!growthHistory || growthHistory.length === 0) {
      return <p className="text-muted-foreground text-sm">No growth data available</p>;
    }

    // Format data for the chart
    const chartData = growthHistory
      .slice()
      .sort((a: GrowthEntry, b: GrowthEntry) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry: GrowthEntry) => ({
        date: format(parseISO(entry.date), "MMM dd, yyyy"),
        weight: entry.weight,
        length: entry.length
      }));

    return (
      <div className="space-y-6">
        <div className="h-72">
          <p className="text-sm font-medium mb-2">Weight History (g)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => value.split(' ')[0]}
                fontSize={12}

              />
              <YAxis 
                width={35}
                fontSize={11}
                tickFormatter={formatChartAmount}
              />
              <CartesianGrid strokeDasharray="3 3"   stroke="var(--color-border)"/>
              <RechartsTooltip 
                contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                labelStyle={{ color: "#9ca3af" }}
                itemStyle={{ color: "#ffffff" }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <p className="text-sm font-medium mb-2">Length History (cm)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLength" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => value.split(' ')[0]}
                fontSize={12}

              />
              <YAxis 
                width={35}
                fontSize={11}
                tickFormatter={formatChartAmount}
              />
              <CartesianGrid strokeDasharray="3 3"   stroke="var(--color-border)"/>
              <RechartsTooltip 
                contentStyle={{ background: "#1f2937", borderColor: "#374151" }}
                labelStyle={{ color: "#9ca3af" }}
                itemStyle={{ color: "#ffffff" }}
              />
              <Area
                type="monotone"
                dataKey="length"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorLength)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Growth Log</h4>
          <div className="max-w-[320px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight (g)</TableHead>
                  <TableHead>Length (cm)</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {growthHistory.slice(0, 5).map((entry: GrowthEntry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.weight} g</TableCell>
                    <TableCell>{entry.length} cm</TableCell>
                    <TableCell>{entry.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {growthHistory.length > 5 && (
            <div className="text-center mt-2">
              <Button variant="link" size="sm">View All Growth Records</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 ">
      <Card className="px-0 gap-3 border-0 py-3 shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Growth History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {displayGrowthData(reptileDetails.growth_history)}
        </CardContent>
      </Card>
    </div>
  );
} 