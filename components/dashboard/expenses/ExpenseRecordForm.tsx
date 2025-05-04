'use client'

import { 
  ExpenseRecord, 
  NewExpenseRecord, 
  ExpenseCategory, 
  ExpenseStatus, 
  ExpenseCategoryType,
  ExpenseStatusType
} from '@/lib/types/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Resolver } from 'react-hook-form'
import { CalendarIcon,  StoreIcon, PhoneIcon, FileTextIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import * as z from 'zod'

 const expenseFormSchema = z.object({
  expense_date: z.string({ required_error: 'Please select a date' }),
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .min(0.01, 'Amount must be at least 0.01'),
  category: z.enum(Object.values(ExpenseCategory) as [ExpenseCategoryType, ...ExpenseCategoryType[]], {
    required_error: 'Please select a category',
  }),
  status: z.enum(Object.values(ExpenseStatus) as [ExpenseStatusType, ...ExpenseStatusType[]], {
    required_error: 'Please select a status',
  }),
  vendor_name: z.string().min(2, 'Vendor name must be at least 2 characters'),
  vendor_contact: z.string().optional(),
  receipt: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
interface ExpenseRecordFormProps {
  initialData?: ExpenseRecord | null
  onSubmit: (data: NewExpenseRecord) => void
  onCancel: () => void
}

export function ExpenseRecordForm({ initialData, onSubmit, onCancel }: ExpenseRecordFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as Resolver<ExpenseFormValues>,
    defaultValues: {
      expense_date: initialData?.expense_date || new Date().toISOString().split('T')[0],
      amount: initialData?.amount || 0,
      category: initialData?.category || 'food',
      status: initialData?.status || 'pending',
      vendor_name: initialData?.vendor_name || '',
      vendor_contact: initialData?.vendor_contact || '',
      receipt: initialData?.receipt || '',
      notes: initialData?.notes || ''
    }
  })

  const handleFormSubmit = form.handleSubmit((data: ExpenseFormValues) => {
    const formattedData: NewExpenseRecord = {
      ...data,
    }
    
    onSubmit(formattedData)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expense_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ExpenseCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ExpenseStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor_contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Contact</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
    
        <FormField
          control={form.control}
          name="receipt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" type="url" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Expense
          </Button>
        </div>
      </form>
    </Form>
  )
}