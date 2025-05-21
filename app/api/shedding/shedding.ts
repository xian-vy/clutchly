import { createClient } from '@/lib/supabase/client'
import { CreateSheddingInput, Shedding, UpdateSheddingInput, SheddingWithReptile } from '@/lib/types/shedding'

export async function getSheddingRecords(): Promise<SheddingWithReptile[]> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id

  const { data: sheddingRecords, error } = await supabase
    .from('shedding')
    .select(`
      *,
      reptile:reptiles (
      *,
        location:locations (
          id,
          label,
          rack:racks (
            id,
            name,
            room:rooms (
              id,
              name
            )
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('shed_date', { ascending: false })

  if (error) throw error
  const records = sheddingRecords as SheddingWithReptile[]
  if (records.some(record => !record.reptile)) {
    throw new Error('Could not find reptile data for some shedding records')
  }
  return records
}

export async function getSheddingById(id: string) {
  const supabase = await createClient()
  
  const { data: shedding, error } = await supabase
    .from('shedding')
    .select(`
      *,
      reptile:reptiles (
      *,
        location:locations (
          id,
          label,
          rack:racks (
            id,
            name,
            room:rooms (
              id,
              name
            )
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return shedding as Shedding
}

export async function createShedding(shedding: CreateSheddingInput): Promise<SheddingWithReptile> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id

  const newShedding = {
    ...shedding,
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('shedding')
    .insert([newShedding])
    .select(`
      *,
      reptile:reptiles (
      *,
        location:locations (
          id,
          label,
          rack:racks (
            id,
            name,
            room:rooms (
              id,
              name
            )
          )
        )
      )
    `)
    .single()

  if (error) throw error
  if (!data.reptile) {
    throw new Error('Could not find reptile data for created shedding record')
  }
  return data as SheddingWithReptile
}

export async function createBatchShedding(sheddings: CreateSheddingInput[]): Promise<SheddingWithReptile[]> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id

  const newSheddings = sheddings.map(shedding => ({
    ...shedding,
    user_id: userId,
  }))

  const { data, error } = await supabase
    .from('shedding')
    .insert(newSheddings)
    .select(`
      *,
      reptile:reptiles (
      *,
        location:locations (
          id,
          label,
          rack:racks (
            id,
            name,
            room:rooms (
              id,
              name
            )
          )
        )
      )
    `)

  if (error) throw error
  const records = data as SheddingWithReptile[]
  if (records.some(record => !record.reptile)) {
    throw new Error('Could not find reptile data for some created shedding records')
  }
  return records
}

export async function updateShedding(id: string, updates: UpdateSheddingInput): Promise<SheddingWithReptile> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shedding')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      reptile:reptiles (
      *,
        location:locations (
          id,
          label,
          rack:racks (
            id,
            name,
            room:rooms (
              id,
              name
            )
          )
        )
      )
    `)
    .single()

  if (error) throw error
  if (!data.reptile) {
    throw new Error('Could not find reptile data for updated shedding record')
  }
  return data as SheddingWithReptile
}

export async function deleteShedding(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('shedding')
    .delete()
    .eq('id', id)

  if (error) throw error
}
