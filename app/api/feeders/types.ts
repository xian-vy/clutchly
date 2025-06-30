import { createClient } from '@/lib/supabase/client';
import { FeederType, NewFeederType } from '@/lib/types/feeders';
import { getUserAndOrganizationInfo } from '../utils_client';
import { Organization } from '@/lib/types/organizations';

export async function getFeederTypes(organization : Organization): Promise<FeederType[]> {
  const supabase =  createClient();
  
  const { data: preyTypes, error } = await supabase
    .from('feeder_types')
    .select('*')
    .or(`is_global.eq.true,org_id.eq.${organization.id}`)
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
  const { organization } = await getUserAndOrganizationInfo()

  
  const newFeederType = {
    ...feederType,
    org_id: organization.id,
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