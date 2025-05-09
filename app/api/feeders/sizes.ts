import { createClient } from '@/lib/supabase/client';
import { FeederSize, NewFeederSize } from '@/lib/types/feeders';

export async function getPreySizes(): Promise<FeederSize[]> {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  
  const { data: preySizes, error } = await supabase
    .from('feeder_sizes')
    .select('*')
    .or(`is_global.eq.true,user_id.eq.${userId}`)
    .order('name');

  if (error) throw error;
  return preySizes as FeederSize[];
}

export async function getPreySizeById(id: string): Promise<FeederSize> {
  const supabase = await createClient();
  
  const { data: preySize, error } = await supabase
    .from('feeder_sizes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return preySize as FeederSize;
}

export async function createPreySize(preySize: NewFeederSize): Promise<FeederSize> {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  
  const newPreySize = {
    ...preySize,
    user_id: userId,
  };
  
  const { data, error } = await supabase
    .from('feeder_sizes')
    .insert([newPreySize])
    .select()
    .single();

  if (error) throw error;
  return data as FeederSize;
}

export async function updatePreySize(id: string, updates: Partial<NewFeederSize>): Promise<FeederSize> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('feeder_sizes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FeederSize;
}

export async function deletePreySize(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('feeder_sizes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}