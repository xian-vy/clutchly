import { createClient } from '@/lib/supabase/client'
import { AccessControl, AccessProfile, CreateAccessControl, CreateAccessProfile } from '@/lib/types/access';

export interface Page {
  id: string;
  name: string;
}

export async function getPages() {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Page[];
}

export async function getAccessProfiles() {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('access_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AccessProfile[];
}

export async function getAccessControls(profileId: string) {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('access_controls')
    .select(`
      *,
      pages (
        id,
        name
      )
    `)
    .eq('access_profile_id', profileId);

  if (error) throw error;
  return data as (AccessControl & { pages: { id: string; name: string } })[];
}

export async function createAccessProfile(profile: CreateAccessProfile) {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('access_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data as AccessProfile;
}

export async function updateAccessProfile(id: string, profile: CreateAccessProfile) {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('access_profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AccessProfile;
}

export async function deleteAccessProfile(id: string) {
    const supabase =  createClient()

  const { error } = await supabase
    .from('access_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createAccessControl(control: CreateAccessControl) {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('access_controls')
    .insert(control)
    .select()
    .single();

  if (error) throw error;
  return data as AccessControl;
}

export async function updateAccessControl(id: string, control: Partial<AccessControl>) {
    const supabase =  createClient()

  const { data, error } = await supabase
    .from('access_controls')
    .update(control)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AccessControl;
}

export async function deleteAccessControl(id: string) {   
     const supabase =  createClient()

  const { error } = await supabase
    .from('access_controls')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
