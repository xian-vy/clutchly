'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesSummary } from "@/lib/types/sales";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Diff,
  Dna,
  DollarSign,
  Shell,
  ShoppingCart,
  TrendingUp,
  X
} from "lucide-react";

interface SalesSummaryStatsProps {
  data: SalesSummary | undefined;
  speciesData?: { name: string; value: number }[];
  morphData?: { name: string; value: number }[];
}

export function SalesSummaryStats({ data, speciesData, morphData }: SalesSummaryStatsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              No data available
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate completed sales (for success rate)
  const completedSales = data.sales_by_status.completed;
  const successRate = data.total_sales > 0
    ? ((completedSales / data.total_sales) * 100).toFixed(1)
    : "0.0";

  // Calculate refund rate
  const refundedSales = data.sales_by_status.refunded;
  const refundRate = data.total_sales > 0
    ? ((refundedSales / data.total_sales) * 100).toFixed(1)
    : "0.0";

  // Get top species and morph if available
  const topSpecies = speciesData && speciesData.length > 0 ? speciesData[0] : null;
  const topMorph = morphData && morphData.length > 0 ? morphData[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sales */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
            Total Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_sales}</div>
          <p className="text-xs text-muted-foreground">Records</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.total_revenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">USD</p>
        </CardContent>
      </Card>

      {/* Average Price */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Diff className="h-4 w-4 mr-2 text-blue-500" />
            Average Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.average_price.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Per sale</p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {successRate}%
            {Number(successRate) > 75 ? (
              <ArrowUp className="h-4 w-4 ml-2 text-green-500" />
            ) : Number(successRate) < 50 ? (
              <ArrowDown className="h-4 w-4 ml-2 text-red-500" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">Completed sales</p>
        </CardContent>
      </Card>

      {/* Refund Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Activity className="h-4 w-4 mr-2 text-yellow-500" />
            Refund Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            {refundRate}%
            {Number(refundRate) > 10 ? (
              <ArrowUp className="h-4 w-4 ml-2 text-red-500" />
            ) : Number(refundRate) < 5 ? (
              <ArrowDown className="h-4 w-4 ml-2 text-green-500" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">Refunded sales</p>
        </CardContent>
      </Card>

      {/* Cancelled Orders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <X className="h-4 w-4 mr-2 text-red-500" />
            Cancelled Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.sales_by_status.cancelled}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.total_sales > 0
              ? ((data.sales_by_status.cancelled / data.total_sales) * 100).toFixed(1)
              : "0.0"}% of total
          </p>
        </CardContent>
      </Card>

      {/* Top Selling Species */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Dna className="h-4 w-4 mr-2 text-indigo-500" />
            Top Species
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topSpecies ? topSpecies.name : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topSpecies ? `${topSpecies.value} sales` : "No data available"}
          </p>
        </CardContent>
      </Card>

      {/* Top Selling Morph */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Shell className="h-4 w-4 mr-2 text-emerald-500" />
            Top Morph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topMorph ? topMorph.name : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topMorph ? `${topMorph.value} sales` : "No data available"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 