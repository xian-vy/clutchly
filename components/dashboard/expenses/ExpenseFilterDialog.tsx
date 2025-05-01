'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_STATUS_COLORS } from '@/lib/constants/colors';
import { ExpenseRecord } from '@/lib/types/expenses';
import { Filter } from 'lucide-react';
import { useState } from 'react';

interface ExpenseFilterDialogProps {
  onFilterChange: (filters: ExpenseFilters) => void;
}

export interface ExpenseFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
}

export function ExpenseFilterDialog({ onFilterChange }: ExpenseFilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const handleFilterChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: ExpenseFilters = {};
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </DialogTrigger>
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
              onValueChange={(value) => handleFilterChange({ ...filters, status: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_STATUS_COLORS).map(([status, color]) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateFrom" className="text-right">
              Date From
            </Label>
            <Input
              id="dateFrom"
              type="date"
              className="col-span-3"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange({ ...filters, dateFrom: e.target.value })}
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
              value={filters.dateTo}
              onChange={(e) => handleFilterChange({ ...filters, dateTo: e.target.value })}
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
              value={filters.amountFrom}
              onChange={(e) => handleFilterChange({ ...filters, amountFrom: Number(e.target.value) })}
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
              value={filters.amountTo}
              onChange={(e) => handleFilterChange({ ...filters, amountTo: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={() => setIsOpen(false)}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 