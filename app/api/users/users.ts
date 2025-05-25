import { createClient } from '@/lib/supabase/client'
import { CreateUser, User } from '@/lib/types/users';

export async function getUsers() {
  const supabase =  createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as User[];
}

export async function createUser(user: CreateUser) {
  const supabase =  createClient()

  // First create the auth user with email confirmation
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: user.full_name,
        org_id: user.org_id,
        access_profile_id: user.access_profile_id,
        role: user.role,
      }
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new Error('A user with this email already exists');
    }
    throw authError;
  }
  
  if (!authData.user) throw new Error('Failed to create user');

  // Then create the user record
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      org_id: user.org_id,
      access_profile_id: user.access_profile_id,
      full_name: user.full_name,
      role: user.role,
    })
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, user: Partial<User>) {
  const supabase =  createClient()

  const { data, error } = await supabase
    .from('users')
    .update(user)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function deleteUser(id: string): Promise<void> {
  const supabase =  createClient()

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
