export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'paypal' | 'other'

export interface SaleRecord {
  id: string
  user_id: string
  reptile_id: string
  sale_date: string
  price: number
  buyer_name: string
  buyer_email?: string
  buyer_phone?: string
  payment_method: PaymentMethod
  status: SaleStatus
  invoice_number?: string
  shipping_details?: string
  notes?: string
  includes_documents: boolean
  created_at: string
  updated_at: string
}

export interface SalesSummary {
  total_sales: number
  total_revenue: number
  average_price: number
  sales_by_status: {
    [key in SaleStatus]: number
  }
  sales_by_payment_method: {
    [key in PaymentMethod]: number
  }
  monthly_sales: {
    month: string
    count: number
    revenue: number
  }[]
}

export type NewSaleRecord = Omit<SaleRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'> 