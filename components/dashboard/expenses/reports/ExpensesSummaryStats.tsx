'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpensesSummary } from '@/lib/types/expenses';
import { formatCurrency } from '@/lib/utils';
import {
  BanknoteIcon,
  CalendarIcon,
  ListIcon,
  TagIcon
} from 'lucide-react';

interface ExpensesSummaryStatsProps {
  summary: ExpensesSummary | undefined;
}

export function ExpensesSummaryStats({ summary }: ExpensesSummaryStatsProps) {
  if (!summary) {
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

  // Find top category
  const topCategory = Object.entries(summary.expensesByCategory)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  const topCategoryAmount = summary.expensesByCategory[topCategory] || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <BanknoteIcon className="h-4 w-4 mr-2 text-primary" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-green-500" />
            Monthly Average
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-2xl font-bold">{formatCurrency(summary.monthlyAverage)}</div>
          <p className="text-xs text-muted-foreground">Per month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <ListIcon className="h-4 w-4 mr-2 text-blue-500" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-2xl font-bold">{summary.categoriesCount}</div>
          <p className="text-xs text-muted-foreground">Expense types</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <TagIcon className="h-4 w-4 mr-2 text-yellow-500" />
            Top Category
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-2xl font-bold">{topCategory}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(topCategoryAmount)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 