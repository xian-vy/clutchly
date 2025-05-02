'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EXPENSE_STATUS_COLORS, YES_NO_COLORS } from '@/lib/constants/colors';
import { ExpenseRecord, ExpenseStatusType } from '@/lib/types/expenses';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye, Filter, MoreHorizontal, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { ExpenseFilterDialog, ExpenseFilters } from './ExpenseFilterDialog';

interface ExpenseRecordListProps {
  expenses: ExpenseRecord[];
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (expense: ExpenseRecord) => void;
  filters: ExpenseFilters;
  isFilterDialogOpen: boolean;
  onOpenFilterDialog: () => void;
  onCloseFilterDialog: () => void;
  onApplyFilters: (filters: ExpenseFilters) => void;
}

export function ExpenseRecordList({
  expenses,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails,
  filters,
  isFilterDialogOpen,
  onOpenFilterDialog,
  onCloseFilterDialog,
  onApplyFilters,
}: ExpenseRecordListProps) {
  // Apply filters to expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Status filter
      if (filters.status && expense.status !== filters.status) return false;
      
      // Date range filter
      if (filters.dateFrom && new Date(expense.expense_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(expense.expense_date) > new Date(filters.dateTo)) return false;
      
      // Amount range filter
      if (filters.amountFrom && expense.amount < filters.amountFrom) return false;
      if (filters.amountTo && expense.amount > filters.amountTo) return false;
      
      // Category filter
      if (filters.category && expense.category !== filters.category) return false;
      
      // Vendor filter
      if (filters.vendor && !expense.vendor_name.toLowerCase().includes(filters.vendor.toLowerCase())) return false;
      
      return true;
    });
  }, [expenses, filters]);

  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.amountFrom !== undefined && filters.amountFrom > 0) count++;
    if (filters.amountTo !== undefined && filters.amountTo < 20000) count++;
    if (filters.category) count++;
    if (filters.vendor) count++;
    return count;
  }, [filters]);

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: 'expense_date',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.getValue('expense_date') as string), 'MMM d, yyyy'),
    },
    {
      accessorKey: 'vendor_name',
      header: 'Vendor',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `$${(row.getValue('amount') as number).toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ExpenseStatusType;
        return (
          <Badge variant="custom"
            className={`${EXPENSE_STATUS_COLORS[status.toLowerCase() as keyof typeof EXPENSE_STATUS_COLORS]} capitalize`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "notes",
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string | null;
        const label = notes && notes.length > 0 ? "yes" : "no";
        return (
          <Badge
            variant="custom"
            className={`${YES_NO_COLORS[label.toLowerCase() as keyof typeof YES_NO_COLORS]} capitalize`}
          >
            {label}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(expense)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(expense)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(expense.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Custom filter button for the DataTable
  const CustomFilterButton = () => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onOpenFilterDialog}
      className="relative"
    >
      <Filter className="h-4 w-4 mr-1" />
      Filter
      {activeFilterCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute text-white rounded-sm -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 font-normal text-[0.65rem]"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredExpenses}
        onAddNew={onAddNew}
        filterButton={<CustomFilterButton />}
      />
      
      <ExpenseFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={onCloseFilterDialog}
        onApplyFilters={onApplyFilters}
        currentFilters={filters}
      />
    </>
  );
} 