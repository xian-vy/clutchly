import { createClient } from '@/lib/supabase/client'
import { NewSaleRecord, SaleRecord, SalesSummary } from '@/lib/types/sales'

const supabase = createClient()

export interface SalesFilterParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  speciesId?: string;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  priceMin?: number;
  priceMax?: number;
}

export async function getSalesRecords(): Promise<SaleRecord[]> {
  const { data, error } = await supabase
    .from('sales_records')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getSalesRecord(id: string): Promise<SaleRecord> {
  const { data, error } = await supabase
    .from('sales_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSalesRecord(record: NewSaleRecord): Promise<SaleRecord> {
  const supabase = createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  const newSaleRecord = {
    ...record,
    user_id: userId,
  }
  const { data, error } = await supabase
    .from('sales_records')
    .insert([newSaleRecord])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSalesRecord(
  id: string,
  record: NewSaleRecord
): Promise<SaleRecord> {
  const { data, error } = await supabase
    .from('sales_records')
    .update(record)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSalesRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('sales_records')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getSalesByDateRange(filters?: SalesFilterParams): Promise<SaleRecord[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('sales_records')
    .select('*, reptiles(*)')
    
  // Apply filtering
  if (filters) {
    // Date filtering
    if (filters.startDate) {
      query = query.gte('sale_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('sale_date', filters.endDate)
    }
    
    // Status filtering
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    // Payment method filtering
    if (filters.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod)
    }
    
    // Price range filtering
    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }
    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }
  }
  
  // Order by sale date by default
  query = query.order('sale_date', { ascending: false })
  
  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getSalesSummary(filters?: SalesFilterParams): Promise<SalesSummary> {
  const salesRecords = await getSalesByDateRange(filters)
  
  if (!salesRecords.length) {
    return {
      total_sales: 0,
      total_revenue: 0,
      average_price: 0,
      sales_by_status: {
        pending: 0,
        completed: 0,
        cancelled: 0,
        refunded: 0
      },
      sales_by_payment_method: {
        cash: 0,
        bank_transfer: 0,
        credit_card: 0,
        paypal: 0,
        other: 0
      },
      monthly_sales: []
    }
  }
  
  // Calculate total sales and revenue
  const total_sales = salesRecords.length
  const total_revenue = salesRecords.reduce((sum, record) => sum + record.price, 0)
  const average_price = total_revenue / total_sales
  
  // Count sales by status
  const sales_by_status = {
    pending: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0
  }
  
  // Count sales by payment method
  const sales_by_payment_method = {
    cash: 0,
    bank_transfer: 0,
    credit_card: 0,
    paypal: 0,
    other: 0
  }
  
  // Prepare monthly sales tracking
  const monthlyData: Record<string, { count: number, revenue: number }> = {}
  
  // Process each sale record
  salesRecords.forEach(record => {
    // Update status counts
    sales_by_status[record.status]++
    
    // Update payment method counts
    sales_by_payment_method[record.payment_method]++
    
    // Track monthly sales
    const monthYear = new Date(record.sale_date).toISOString().substring(0, 7) // YYYY-MM format
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { count: 0, revenue: 0 }
    }
    
    monthlyData[monthYear].count++
    monthlyData[monthYear].revenue += record.price
  })
  
  // Convert monthly data to array format
  const monthly_sales = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    count: data.count,
    revenue: data.revenue
  })).sort((a, b) => a.month.localeCompare(b.month))
  
  return {
    total_sales,
    total_revenue,
    average_price,
    sales_by_status,
    sales_by_payment_method,
    monthly_sales
  }
}

// Get sales distribution by reptile species
export async function getSalesBySpecies(filters?: SalesFilterParams): Promise<{ name: string; value: number }[]> {
  const salesRecords = await getSalesByDateRange(filters);
  
  if (!salesRecords.length) {
    return [];
  }
  
  // Get all reptile IDs
  const reptileIds = salesRecords.map(record => record.reptile_id);
  
  // Fetch reptile details with species info
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select('id, species_id')
    .in('id', reptileIds);
    
  if (error) throw error;

  // Get unique species IDs
  const speciesIds = [...new Set(reptiles.map(reptile => reptile.species_id))];
  
  // Fetch species details
  const { data: speciesData, error: speciesError } = await supabase
    .from('species')
    .select('id, name')
    .in('id', speciesIds);
    
  if (speciesError) throw speciesError;
  
  // Create a lookup map for species
  const speciesMap = new Map(speciesData.map(species => [species.id, species.name]));
  
  // Create a lookup map for reptile species
  const reptileSpeciesMap = new Map();
  
  // Process each reptile to extract species ID
  reptiles.forEach(reptile => {
    const speciesName = speciesMap.get(reptile.species_id) || 'Unknown';
    reptileSpeciesMap.set(reptile.id, speciesName);
  });
  
  // Count sales by species
  const speciesCounts: Record<string, number> = {};
  
  salesRecords.forEach(record => {
    const speciesName = reptileSpeciesMap.get(record.reptile_id) || 'Unknown';
    speciesCounts[speciesName] = (speciesCounts[speciesName] || 0) + 1;
  });
  
  // Convert to array format
  return Object.entries(speciesCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort by most sales first
}

// Get sales distribution by reptile morphs
export async function getSalesByMorphs(filters?: SalesFilterParams): Promise<{ name: string; value: number }[]> {
  const salesRecords = await getSalesByDateRange(filters);
  
  if (!salesRecords.length) {
    return [];
  }
  
  // Get all reptile IDs
  const reptileIds = salesRecords.map(record => record.reptile_id);
  
  // Fetch reptile details with morph ID
  const { data: reptiles, error } = await supabase
    .from('reptiles')
    .select('id, morph_id')
    .in('id', reptileIds);
    
  if (error) throw error;
  
  // Get unique morph IDs
  const morphIds = [...new Set(reptiles.map(reptile => reptile.morph_id))];
  
  // Fetch morph details
  const { data: morphData, error: morphError } = await supabase
    .from('morphs')
    .select('id, name')
    .in('id', morphIds);
    
  if (morphError) throw morphError;
  
  // Create a lookup map for morphs
  const morphMap = new Map(morphData.map(morph => [morph.id, morph.name]));
  
  // Create a lookup map for reptile morphs
  const reptileMorphMap = new Map();
  
  // Process each reptile to extract morph
  reptiles.forEach(reptile => {
    const morphName = morphMap.get(reptile.morph_id) || 'Unknown';
    reptileMorphMap.set(reptile.id, morphName);
  });
  
  // Count sales by morph
  const morphCounts: Record<string, number> = {};
  
  salesRecords.forEach(record => {
    const morphName = reptileMorphMap.get(record.reptile_id) || 'Unknown';
    morphCounts[morphName] = (morphCounts[morphName] || 0) + 1;
  });
  
  // Convert to array format and limit to top 10 for visibility
  return Object.entries(morphCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Sort by most sales first
    .slice(0, 10); // Limit to top 10 morphs
}