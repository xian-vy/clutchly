import { createClient } from '@/lib/supabase/client';
import { FeederType, NewFeederType } from '@/lib/types/feeders';

export async function getFeederTypes(): Promise<FeederType[]> {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  
  const { data: preyTypes, error } = await supabase
    .from('feeder_types')
    .select('*')
    .or(`is_global.eq.true,user_id.eq.${userId}`)
    .order('name');

  if (error) throw error;
  return preyTypes as FeederType[];
}

export async function getFeederTypeById(id: string): Promise<FeederType> {
  const supabase = await createClient();
  
  const { data: feederType, error } = await supabase
    .from('feeder_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return feederType as FeederType;
}

export async function createFeederType(feederType: NewFeederType): Promise<FeederType> {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  
  const newFeederType = {
    ...feederType,
    user_id: userId,
  };
  
  const { data, error } = await supabase
    .from('feeder_types')
    .insert([newFeederType])
    .select()
    .single();

  if (error) throw error;
  return data as FeederType;
}

export async function updateFeederType(id: string, updates: Partial<NewFeederType>): Promise<FeederType> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('feeder_types')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FeederType;
}

export async function deleteFeederType(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('feeder_types')
    .delete()
    .eq('id', id);

  if (error) throw error;
}