'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EXPENSE_STATUS_COLORS } from '@/lib/constants/colors';
import { ExpenseRecord } from '@/lib/types/expenses';
import { format } from 'date-fns';
import { Edit } from 'lucide-react';

interface ExpenseRecordDetailsProps {
  expense: ExpenseRecord;
  onEdit: (expense: ExpenseRecord) => void;
  onClose: () => void;
}

export function ExpenseRecordDetails({ expense, onEdit, onClose }: ExpenseRecordDetailsProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Expense Details</span>
            <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Status</span>
            <div className="col-span-3">
              <Badge variant="outline" style={{ backgroundColor: EXPENSE_STATUS_COLORS[expense.status] }}>
                {expense.status}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Date</span>
            <span className="col-span-3">{format(new Date(expense.expense_date), 'PPP')}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Amount</span>
            <span className="col-span-3">${expense.amount.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Category</span>
            <span className="col-span-3">{expense.category}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Vendor</span>
            <span className="col-span-3">{expense.vendor_name}</span>
          </div>

          {expense.notes && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Notes</span>
              <span className="col-span-3">{expense.notes}</span>
            </div>
          )}
          {expense.receipt && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Receipt</span>
              <a
                href={expense.receipt}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-3 text-primary hover:underline"
              >
                View Receipt
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 