import { createClient } from '@/lib/supabase/client'
import { ExpenseRecord, ExpensesSummary, NewExpenseRecord } from '@/lib/types/expenses'
import { getUserAndOrganizationInfo } from '../utils_client';

const supabase = createClient()

export interface ExpensesFilterParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  amountMin?: number;
  amountMax?: number;
}

export async function getExpensesRecords(dateRange?: { startDate?: string; endDate?: string }): Promise<ExpenseRecord[]> {
  const { organization } = await getUserAndOrganizationInfo()

  let query = supabase
    .from('expenses_records')
    .select('*')
    .eq('org_id', organization.id)

  // Apply date filtering if range is provided
  if (dateRange) {
    if (dateRange.startDate) {
      query = query.gte('expense_date', dateRange.startDate)
    }
    if (dateRange.endDate) {
      // Set end date to end of day
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('expense_date', endDate.toISOString())
    }
  }

  // Order by expense date by default
  query = query.order('expense_date', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getExpenseRecord(id: string): Promise<ExpenseRecord> {
  const { data, error } = await supabase
    .from('expenses_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createExpenseRecord(record: NewExpenseRecord): Promise<ExpenseRecord> {
  const { organization } = await getUserAndOrganizationInfo()

  const newExpenseRecord = {
    ...record,
    org_id: organization.id,
  }
  
  const { data, error } = await supabase
    .from('expenses_records')
    .insert([newExpenseRecord])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpenseRecord(
  id: string,
  record: NewExpenseRecord
): Promise<ExpenseRecord> {
  const { data, error } = await supabase
    .from('expenses_records')
    .update(record)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpenseRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses_records')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getExpensesByDateRange(filters?: ExpensesFilterParams): Promise<ExpenseRecord[]> {
  const { organization } = await getUserAndOrganizationInfo()
  let query = supabase
    .from('expenses_records')
    .select('*')
    .eq('org_id', organization.id)
    
  // Apply filtering
  if (filters) {
    // Date filtering
    if (filters.startDate) {
      query = query.gte('expense_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('expense_date', filters.endDate)
    }
    
    // Status filtering
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    // Category filtering
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    // Amount range filtering
    if (filters.amountMin !== undefined) {
      query = query.gte('amount', filters.amountMin)
    }
    if (filters.amountMax !== undefined) {
      query = query.lte('amount', filters.amountMax)
    }
  }
  
  // Order by expense date by default
  query = query.order('expense_date', { ascending: false })
  
  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getExpensesSummary(filters?: ExpensesFilterParams): Promise<ExpensesSummary> {
  const { organization } = await getUserAndOrganizationInfo()

  let query = supabase
    .from('expenses_records')
    .select('*')
    .eq('org_id', organization.id)
    .order('expense_date', { ascending: false })
    
  // Apply filters if provided
  if (filters) {
    if (filters.startDate) {
      query = query.gte('expense_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('expense_date', filters.endDate)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
  }

  const { data: expenses, error } = await query

  if (error) {
    throw error
  }

  const expensesByCategory: Record<string, number> = {}
  const monthlyExpenses: Record<string, number> = {}
  let totalExpenses = 0

  expenses.forEach((expense) => {
    // Calculate total expenses
    totalExpenses += expense.amount

    // Calculate expenses by category
    const category = expense.category
    expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount

    // Calculate monthly expenses
    const month = new Date(expense.expense_date).toISOString().slice(0, 7)
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount
  })

  // Calculate monthly average
  const monthlyAverage = totalExpenses / (Object.keys(monthlyExpenses).length || 1)

  // Calculate categories count
  const categoriesCount = Object.keys(expensesByCategory).length

  return {
    totalExpenses,
    expensesByCategory,
    monthlyExpenses,
    monthlyAverage,
    categoriesCount
  }
}

export async function getExpensesByCategory(filters: ExpensesFilterParams) {
  const supabase = createClient();
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
    throw new Error('Not authenticated');
  }

  let query = supabase
    .from('expenses_records')
    .select('*')
    .eq('org_id', organization.id);

  if (filters.startDate) {
    query = query.gte('expense_date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('expense_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
