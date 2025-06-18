'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpensesSummary } from '@/lib/types/expenses';
import { formatPrice } from '@/lib/utils';
import {
  CalendarIcon,
  DollarSign,
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium  flex items-center justify-between">
            Total Expenses
            <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
               <DollarSign className="h-4 w-4 text-foreground/80" />
          </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-lg sm:text-2xl font-bold">{formatPrice(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Total Amount</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium  flex items-center justify-between">
            Monthly Average
           <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
              <CalendarIcon className="h-4 w-4 text-foreground/80" />
          </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-lg sm:text-2xl font-bold">{formatPrice(summary.monthlyAverage)}</div>
          <p className="text-xs text-muted-foreground">Per month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Categories
            <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
              <ListIcon className="h-4 w-4  text-foreground/80 " />
           </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-lg sm:text-2xl font-bold">{summary.categoriesCount}</div>
          <p className="text-xs text-muted-foreground">Expense Categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            Top Category
           <div className="bg-muted dark:bg-muted/80 p-2 rounded-md">
              <TagIcon className="h-4 w-4 text-foreground/80" />
          </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          <div className="text-lg sm:text-2xl font-bold capitalize">{topCategory}</div>
          <p className="text-xs text-muted-foreground">
            {formatPrice(topCategoryAmount)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 