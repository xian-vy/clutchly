'use server'
import { createClient } from '@/lib/supabase/server'
import { AccessControl, AccessProfileWithControls, CreateAccessControl, CreateAccessProfile } from '@/lib/types/access';

export interface Page {
  id: string;
  name: string;
}

export async function getPages() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Page[];
}

export async function getAccessProfiles() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (userError || !userData) throw new Error('User organization not found')


    const { data, error } = await supabase
        .from('access_profiles')
        .select(`
            *,
            access_controls (*)
        `)
        .eq('org_id', userData.org_id)
        .order('created_at', { ascending: false });

    console.log('Access Profiles:', data);
    if (error) throw error;
    return data as AccessProfileWithControls[];
}

export async function getAccessControls(profileId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    const { data, error } = await supabase
        .from('access_controls')
        .select(`
            *,
            pages (
                id,
                name
            ),
            access_profiles!inner (
                org_id
            )
        `)
        .eq('access_profile_id', profileId)
        .eq('access_profiles.org_id', userData.org_id);


    if (error) throw error;
    return data as (AccessControl & { pages: { id: string; name: string } })[];
}

export async function createAccessProfile(profile: CreateAccessProfile) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    // Verify the user is creating for their own organization
    if (profile.org_id !== userData.org_id) {
        throw new Error('Cannot create access profile for another organization')
    }

    // Start a transaction
    const { data: accessProfile, error: profileError } = await supabase
        .from('access_profiles')
        .insert({
            org_id: profile.org_id,
            name: profile.name,
            description: profile.description
        })
        .select()
        .single();

    if (profileError) throw profileError;

    // Create access controls for the profile
    const accessControls = profile.access_controls.map(control => ({
        access_profile_id: accessProfile.id,
        page_id: control.page_id,
        can_view: control.can_view,
        can_edit: control.can_edit,
        can_delete: control.can_delete
    }));

    const { error: controlsError } = await supabase
        .from('access_controls')
        .insert(accessControls);

    if (controlsError) {
        // If controls creation fails, delete the profile to maintain consistency
        await supabase
            .from('access_profiles')
            .delete()
            .eq('id', accessProfile.id);
        throw controlsError;
    }

    // Return the profile with its controls
    const { data: profileWithControls, error: fetchError } = await supabase
        .from('access_profiles')
        .select(`
            *,
            access_controls (*)
        `)
        .eq('id', accessProfile.id)
        .single();

    if (fetchError) throw fetchError;
    return profileWithControls as AccessProfileWithControls;
}

export async function updateAccessProfile(id: string, profile: CreateAccessProfile) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    // Verify the profile belongs to the user's organization
    const { data: existingProfile, error: checkError } = await supabase
        .from('access_profiles')
        .select('org_id')
        .eq('id', id)
        .single()

    if (checkError || !existingProfile || existingProfile.org_id !== userData.org_id) {
        throw new Error('Access profile not found or unauthorized')
    }

    // First update the profile
    const { error: updateError } = await supabase
        .from('access_profiles')
        .update({
            name: profile.name,
            description: profile.description
        })
        .eq('id', id);

    if (updateError) throw updateError;

    // Then fetch the updated profile with its controls
    const { data, error: fetchError } = await supabase
        .from('access_profiles')
        .select(`
            *,
            access_controls (*)
        `)
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;
    return data as AccessProfileWithControls;
}

export async function deleteAccessProfile(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    // Verify the profile belongs to the user's organization
    const { data: existingProfile, error: checkError } = await supabase
        .from('access_profiles')
        .select('org_id')
        .eq('id', id)
        .single()

    if (checkError || !existingProfile || existingProfile.org_id !== userData.org_id) {
        throw new Error('Access profile not found or unauthorized')
    }

    const { error } = await supabase
        .from('access_profiles')
        .delete()
        .eq('id', id)
        .eq('org_id', userData.org_id);

    if (error) throw error;
}

export async function createAccessControl(control: CreateAccessControl & { access_profile_id: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    // Verify the access profile belongs to the user's organization
    const { data: profile, error: checkError } = await supabase
        .from('access_profiles')
        .select('org_id')
        .eq('id', control.access_profile_id)
        .single()

    if (checkError || !profile || profile.org_id !== userData.org_id) {
        throw new Error('Access profile not found or unauthorized')
    }

    const { data, error } = await supabase
        .from('access_controls')
        .insert(control)
        .select()
        .single();

    if (error) throw error;
    return data as AccessControl;
}

export async function updateAccessControl(id: string, control: Partial<AccessControl>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    // Verify the access control belongs to the user's organization
    const { data: existingControl, error: checkError } = await supabase
        .from('access_controls')
        .select(`
            id,
            access_profiles!inner (
                org_id
            )
        `)
        .eq('id', id)
        .eq('access_profiles.org_id', userData.org_id)
        .single()

    if (checkError || !existingControl) {
        throw new Error('Access control not found or unauthorized')
    }

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('User organization not found')

    // Verify the access control belongs to the user's organization
    const { data: existingControl, error: checkError } = await supabase
        .from('access_controls')
        .select(`
            id,
            access_profiles!inner (
                org_id
            )
        `)
        .eq('id', id)
        .eq('access_profiles.org_id', userData.org_id)
        .single()

    if (checkError || !existingControl) {
        throw new Error('Access control not found or unauthorized')
    }

    const { error } = await supabase
        .from('access_controls')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
