'use client'

import { ExpenseRecord, NewExpenseRecord, ExpenseCategory, ExpenseStatus, ExpenseCategoryType, ExpenseStatusType } from '@/lib/types/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface ExpenseRecordFormProps {
  initialData?: ExpenseRecord | null
  onSubmit: (data: NewExpenseRecord) => void
  onCancel: () => void
}

export function ExpenseRecordForm({ initialData, onSubmit, onCancel }: ExpenseRecordFormProps) {
  const [formData, setFormData] = useState<NewExpenseRecord>({
    expense_date: initialData?.expense_date || new Date().toISOString().split('T')[0],
    amount: initialData?.amount || 0,
    category: initialData?.category || 'food',
    status: initialData?.status || 'pending',
    vendor_name: initialData?.vendor_name || '',
    vendor_contact: initialData?.vendor_contact || '',
    receipt: initialData?.receipt || '',
    notes: initialData?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expense_date">Date</Label>
          <Input
            id="expense_date"
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategoryType })}
          >
            <SelectTrigger  className='w-full'>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ExpenseCategory).map((category) => (
                <SelectItem key={category} value={category || ""}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as ExpenseStatusType })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ExpenseStatus).map((status) => (
                <SelectItem key={status} value={status || ""}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_contact">Vendor Contact</Label>
              <Input
                id="vendor_contact"
                value={formData.vendor_contact}
                onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
              />
            </div>
      </div>
    
      <div className="space-y-2">
        <Label htmlFor="receipt_url">Receipt (Optional)</Label>
        <Input
          id="receipt_url"
          type="url"
          value={formData.receipt}
          onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Expense
        </Button>
      </div>
    </form>
  )
} 