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
import { getCurrentMonthDateRange } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores/authStore'
import { CACHE_KEYS } from '@/lib/constants/cache_keys'

export function ExpensesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExpenseForDetails, setSelectedExpenseForDetails] = useState<ExpenseRecord | null>(null)
  const currentMonthRange = getCurrentMonthDateRange();
  const [filters, setFilters] = useState<ExpenseFilters>({
    dateFrom: currentMonthRange.dateFrom,
    dateTo: currentMonthRange.dateTo,
  })
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const {organization} = useAuthStore()

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
    queryKey: [CACHE_KEYS.EXPENSES, filters.dateFrom, filters.dateTo],
    getResources: async () => {
      if (!organization) return [];
      return getExpensesRecords(organization,{
      startDate: filters.dateFrom,
      endDate: filters.dateTo
    })
  },
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

  const handleApplyFilters = (newFilters: ExpenseFilters) => {
    setFilters(newFilters)
    setIsFilterDialogOpen(false)
  }

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
        expenses={expenses || []}
        onEdit={handleEditExpense}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onAddNew={handleAddExpense}
        filters={filters}
        onOpenFilterDialog={() => setIsFilterDialogOpen(true)}
        isFilterDialogOpen={isFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
        onCloseFilterDialog={() => setIsFilterDialogOpen(false)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>{selectedExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <ExpenseRecordForm
            initialData={selectedExpense}
            onSubmit={async (data) => {
                const success = selectedExpense 
                  ? await handleUpdate(data)
                  : await handleCreate(data);
                if (success) {
                  setIsDialogOpen(false);
              }
            }}
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