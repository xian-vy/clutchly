export const ExpenseCategory = {
  FOOD: 'food',
  SUPPLEMENTS: 'supplements',
  ENCLOSURE: 'enclosure',
  HEATING: 'heating',
  LIGHTING: 'lighting',
  SUBSTRATE: 'substrate',
  VETERINARY: 'veterinary',
  BREEDING: 'breeding',
  SHIPPING: 'shipping',
  UTILITIES: 'utilities',
  OTHER: 'other'
} as const

export const ExpenseStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled'
} as const

export type ExpenseCategoryType = typeof ExpenseCategory[keyof typeof ExpenseCategory]
export type ExpenseStatusType = typeof ExpenseStatus[keyof typeof ExpenseStatus]

export interface ExpenseRecord {
  id: string
  user_id: string
  expense_date: string
  amount: number
  category: ExpenseCategoryType
  description: string
  status: ExpenseStatusType
  vendor_name: string
  vendor_contact?: string
  receipt_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ExpensesSummary {
  totalExpenses: number
  expensesByCategory: Record<string, number>
  monthlyExpenses: Record<string, number>
  monthlyAverage: number
  categoriesCount: number
}

export interface NewExpenseRecord {
  expense_date: string
  amount: number
  category: ExpenseCategoryType
  description: string
  status: ExpenseStatusType
  vendor_name: string
  vendor_contact?: string
  receipt_url?: string
  notes?: string
} 