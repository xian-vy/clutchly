'use client'

import { createExpenseRecord, deleteExpenseRecord, getExpensesRecords, updateExpenseRecord } from '@/app/api/expenses'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useResource } from '@/lib/hooks/useResource'
import { ExpenseRecord, NewExpenseRecord } from '@/lib/types/expenses'
import { useState } from 'react'
import { ExpenseFilters } from './ExpenseFilterDialog'
import { ExpenseRecordDetails } from './ExpenseRecordDetails'
import { ExpenseRecordForm } from './ExpenseRecordForm'
import { ExpenseRecordList } from './ExpenseRecordList'

export function ExpensesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExpenseForDetails, setSelectedExpenseForDetails] = useState<ExpenseRecord | null>(null)
  const [filters, setFilters] = useState<ExpenseFilters>({})

  const {
    resources: expenses,
    isLoading,
    selectedResource: selectedExpense,
    setSelectedResource: setSelectedExpense,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<ExpenseRecord, NewExpenseRecord>({
    resourceName: 'Expense Record',
    queryKey: ['expenses'],
    getResources: getExpensesRecords,
    createResource: createExpenseRecord,
    updateResource: updateExpenseRecord,
    deleteResource: deleteExpenseRecord,
  })

  const handleAddExpense = () => {
    setSelectedExpense(undefined)
    setIsDialogOpen(true)
  }

  const handleEditExpense = (expense: ExpenseRecord) => {
    setSelectedExpense(expense)
    setIsDialogOpen(true)
  }

  const handleFormClose = () => {
    setIsDialogOpen(false)
    setSelectedExpense(undefined)
  }

  const handleCloseExpenseDetails = () => {
    setSelectedExpenseForDetails(null)
  }

  const handleViewDetails = (expense: ExpenseRecord) => {
    setSelectedExpenseForDetails(expense)
  }

  const filteredExpenses = expenses?.filter((expense) => {
    if (filters.status && expense.status !== filters.status) return false
    if (filters.dateFrom && new Date(expense.expense_date) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(expense.expense_date) > new Date(filters.dateTo)) return false
    if (filters.amountFrom && expense.amount < filters.amountFrom) return false
    if (filters.amountTo && expense.amount > filters.amountTo) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Loading expenses...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">


      <ExpenseRecordList
        expenses={filteredExpenses || []}
        onEdit={handleEditExpense}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onAddNew={handleAddExpense}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>{selectedExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <ExpenseRecordForm
            initialData={selectedExpense}
            onSubmit={selectedExpense ? handleUpdate : handleCreate}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {selectedExpenseForDetails && (
        <ExpenseRecordDetails
          expense={selectedExpenseForDetails}
          onEdit={handleEditExpense}
          onClose={handleCloseExpenseDetails}
        />
      )}
    </div>
  )
}