import { createClient } from '@/lib/supabase/client';
import { FeederSize, NewFeederSize } from '@/lib/types/feeders';
import { getUserAndOrganizationInfo } from '../utils_client';
import { Organization } from '@/lib/types/organizations';

export async function getFeederSizes(organization : Organization): Promise<FeederSize[]> {
  const supabase = createClient();
  
  const { data: feederSizes, error } = await supabase
    .from('feeder_sizes')
    .select('*')
    .or(`is_global.eq.true,org_id.eq.${organization.id}`)
    .order('name');

  if (error) throw error;
  return feederSizes as FeederSize[];
}

export async function getFeederSizesByType(feederTypeId: string): Promise<FeederSize[]> {
  const supabase = await createClient();
  const { organization } = await getUserAndOrganizationInfo()

  
  const { data: feederSizes, error } = await supabase
    .from('feeder_sizes')
    .select('*')
    .eq('feeder_type_id', feederTypeId)
    .or(`is_global.eq.true,org_id.eq.${organization.id}`)
    .order('name');

  if (error) throw error;
  return feederSizes as FeederSize[];
}

export async function getFeederSizeById(id: string): Promise<FeederSize> {
  const supabase = await createClient();
  
  const { data: feederSize, error } = await supabase
    .from('feeder_sizes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return feederSize as FeederSize;
}

export async function createFeederSize(feederSize: NewFeederSize): Promise<FeederSize> {
  const supabase = await createClient();
  const { organization } = await getUserAndOrganizationInfo()

  
  const newFeederSize = {
    ...feederSize,
    org_id: organization.id,
  };
  
  const { data, error } = await supabase
    .from('feeder_sizes')
    .insert([newFeederSize])
    .select()
    .single();

  if (error) throw error;
  return data as FeederSize;
}

export async function updateFeederSize(id: string, updates: Partial<NewFeederSize>): Promise<FeederSize> {
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

export async function deleteFeederSize(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('feeder_sizes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}