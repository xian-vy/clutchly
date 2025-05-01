'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_STATUS_COLORS } from '@/lib/constants/colors';
import { useEffect, useState } from 'react';

export interface ExpenseFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: ExpenseFilters) => void;
  currentFilters: ExpenseFilters;
}

export interface ExpenseFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  category?: string;
  vendor?: string;
}

export function ExpenseFilterDialog({ 
  open, 
  onOpenChange, 
  onApplyFilters, 
  currentFilters 
}: ExpenseFilterDialogProps) {
  const [filters, setFilters] = useState<ExpenseFilters>(currentFilters);

  // Update local filters when current filters change
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Expenses</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {Object.entries(EXPENSE_STATUS_COLORS).map(([status]) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              className="col-span-3"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              placeholder="Filter by category"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vendor" className="text-right">
              Vendor
            </Label>
            <Input
              id="vendor"
              className="col-span-3"
              value={filters.vendor || ''}
              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
              placeholder="Filter by vendor name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateFrom" className="text-right">
              Date From
            </Label>
            <Input
              id="dateFrom"
              type="date"
              className="col-span-3"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateTo" className="text-right">
              Date To
            </Label>
            <Input
              id="dateTo"
              type="date"
              className="col-span-3"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amountFrom" className="text-right">
              Amount From
            </Label>
            <Input
              id="amountFrom"
              type="number"
              className="col-span-3"
              value={filters.amountFrom || ''}
              onChange={(e) => setFilters({ ...filters, amountFrom: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amountTo" className="text-right">
              Amount To
            </Label>
            <Input
              id="amountTo"
              type="number"
              className="col-span-3"
              value={filters.amountTo || ''}
              onChange={(e) => setFilters({ ...filters, amountTo: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 