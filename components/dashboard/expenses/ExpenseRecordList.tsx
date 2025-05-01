'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EXPENSE_STATUS_COLORS, SALES_STATUS_COLORS } from '@/lib/constants/colors';
import { ExpenseRecord, ExpenseStatusType } from '@/lib/types/expenses';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

interface ExpenseRecordListProps {
  expenses: ExpenseRecord[];
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (expense: ExpenseRecord) => void;
}

export function ExpenseRecordList({
  expenses,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails,
}: ExpenseRecordListProps) {
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

  return (
    <DataTable
      columns={columns}
      data={expenses}
      onAddNew={onAddNew}
    />
  );
} 