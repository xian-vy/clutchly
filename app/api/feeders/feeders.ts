import { createClient } from '@/lib/supabase/client';
import { Feeders, NewFeederType } from '@/lib/types/feeders';

export async function getFeeders(): Promise<Feeders[]> {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  
  const { data: preyTypes, error } = await supabase
    .from('feeders')
    .select('*')
    .or(`is_global.eq.true,user_id.eq.${userId}`)
    .order('name');

  if (error) throw error;
  return preyTypes as Feeders[];
}

export async function getFeederById(id: string): Promise<Feeders> {
  const supabase = await createClient();
  
  const { data: feederType, error } = await supabase
    .from('feeders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return feederType as Feeders;
}

export async function createFeeder(feederType: NewFeederType): Promise<Feeders> {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  
  const newFeederType = {
    ...feederType,
    user_id: userId,
  };
  
  const { data, error } = await supabase
    .from('feeders')
    .insert([newFeederType])
    .select()
    .single();

  if (error) throw error;
  return data as Feeders;
}

export async function updateFeeder(id: string, updates: Partial<NewFeederType>): Promise<Feeders> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('feeders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Feeders;
}

export async function deleteFeeder(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('feeders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}