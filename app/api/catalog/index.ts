'use server'
import { CatalogEntry, CatalogImage, CatalogSettings, EnrichedCatalogEntry, NewCatalogEntry, NewCatalogImage, NewCatalogSettings } from '@/lib/types/catalog';
import { createClient } from '@/lib/supabase/server'
import { OGTYPE } from '@/lib/types/og';
import { getUserAndOrganizationInfo } from '../utils_server';

// Get all catalog entries for the current user
export async function getCatalogEntries(): Promise<EnrichedCatalogEntry[]> {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  // Execute all remaining queries in parallel
  const [entriesResult, settingsResult, morphResult, speciesResult] = await Promise.all([
    supabase
      .from('catalog_entries')
      .select(`
        *,
        reptiles!inner(*, morph_id, species_id),
        catalog_images(*)
      `)
      .eq('org_id', organization.id)
      .order('display_order', { ascending: true }),
    
    supabase
      .from('catalog_settings')
      .select('*')
      .eq('org_id', organization.id)
      .single(),

    // Get unique morph IDs from entries first
    supabase
      .from('catalog_entries')
      .select('reptiles!inner(morph_id)')
      .eq('org_id', organization.id)
      .overrideTypes<{ reptiles: { morph_id: string } }[], { merge: false }>()
      .then(async (result) => {
        if (result.error) return { data: [] };
        const morphIds = [...new Set(result.data?.map(entry => entry.reptiles.morph_id).filter(Boolean) || [])];
        return supabase
          .from('morphs')
          .select('id, name')
          .in('id', morphIds);
      }),

    // Get unique species IDs from entries first
    supabase
      .from('catalog_entries')
      .select('reptiles!inner(species_id)')
      .eq('org_id', organization.id)
      .overrideTypes<{ reptiles: { species_id: string } }[], { merge: false }>()
      .then(async (result) => {
        if (result.error) return { data: [] };
        const speciesIds = [...new Set(result.data?.map(entry => entry.reptiles.species_id).filter(Boolean) || [])];
        return supabase
          .from('species')
          .select('id, name')
          .in('id', speciesIds);
      })
  ]);

  if (entriesResult.error) throw entriesResult.error;
  const data = entriesResult.data;

  // Handle empty results case
  if (data?.length === 0) {
    const settingsData = settingsResult.data;
    return [{
      id: '',
      org_id: organization.id,
      reptile_id: '',
      featured: false,
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reptiles: null,
      catalog_images: [],
      catalog_settings: settingsData || null,
      organization: organization || null
    }];
  }

  const settingsData = settingsResult.data;
  if (!settingsData) {
    const defaultSettings: NewCatalogSettings = {
      org_id: organization.id,
      bio: null,
      show_bio: false,
      layout_type: 'grid',
      contacts: null,
      address: null,
      about: null
    };
    return [{...data[0], catalog_settings: defaultSettings, organization: organization}];
  }

  // Create maps from morph and species results
  const morphMap = new Map(morphResult.data?.map(morph => [morph.id, morph.name]) || []);
  const speciesMap = new Map(speciesResult.data?.map(sp => [sp.id, sp.name]) || []);

  // Transform the data
  const enrichedData = data?.map(entry => ({
    ...entry,
    reptiles: {
      ...entry.reptiles,
      morph_name: morphMap.get(entry.reptiles.morph_id) || '',
      species_name: speciesMap.get(entry.reptiles.species_id) || ''
    },
    catalog_images: entry.catalog_images || [],
    catalog_settings: settingsData,
    organization: organization
  }));

  return enrichedData || [];
}

// Get catalog entries by organization name (public)
export async function getCatalogEntriesByorgName(orgName: string): Promise<EnrichedCatalogEntry[]> {
  const supabase = await createClient()

  // First get the organization data since other queries depend on it
  const { data: orgData, error: orgError } = await supabase
    .from('view_public_organizations')
    .select('id, full_name, logo')
    .ilike('full_name', `%${orgName}%`)
    .single();

  if (orgError) throw orgError;
  if (!orgData) throw new Error('Organization not found');

  // Now we can run the entries and settings queries in parallel
  const [entriesResult, settingsResult] = await Promise.all([
    supabase
      .from('catalog_entries')
      .select(`
        *,
        reptiles:view_public_catalog!inner(*),
        catalog_images(*)
      `)
      .eq('org_id', orgData.id)
      .order('display_order', { ascending: true }),
    
    supabase
      .from('catalog_settings')
      .select('*')
      .eq('org_id', orgData.id)
      .single()
  ]);

  if (entriesResult.error) throw entriesResult.error;
  const data = entriesResult.data;

  if (data?.length === 0) return [];

  if (settingsResult.error) throw settingsResult.error;
  const settingsData = settingsResult.data;

  // Combine the data with settings
  const enrichedData = data?.map(entry => ({
    ...entry,
    catalog_images: entry.catalog_images || [],
    catalog_settings: settingsData,
    organization: orgData
  }));

  return enrichedData || [];
}

export async function getOpenGraphImages (orgName: string): Promise<OGTYPE[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('view_open_graph')
   .select(`image_url,reptile,price,morph_name `)
   .eq('organization', orgName)

  if (error) throw error;
  if (!data) return [];

  return data as OGTYPE[];
}
export async function getOpenGraphByEntryId(entryId: string): Promise<OGTYPE> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('view_open_graph')
   .select(`image_url,reptile,price,morph_name `)
   .eq('entry_id', entryId)
   .single();

  if (error) throw error;
  if (!data) return {} as OGTYPE;
  return data as OGTYPE;
}
// Create a new catalog entry
export async function createCatalogEntry(entry: NewCatalogEntry): Promise<CatalogEntry> {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  
  const { count } = await supabase
    .from('catalog_entries')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', organization.id);


    
  // If trial user and at limit
  if ((count ?? 0) >= 30) {
    throw new Error('Trial users are limited to 30 reptiles in catalog.');
  }

  // Count featured entries
  if (entry.featured) {
    const { count: featuredCount } = await supabase
      .from('catalog_entries')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', organization.id)
      .eq('featured', true);
    
    // If already at 6 featured entries
    if (featuredCount && featuredCount >= 6) {
      throw new Error('You can only feature up to 6 reptiles. Please unfeature some reptiles first.');
    }
  }

  const { data, error } = await supabase
    .from('catalog_entries')
    .insert({
      ...entry,
      org_id: organization.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  return data;
}

// Update a catalog entry
export async function updateCatalogEntry(id: string, entry: Partial<NewCatalogEntry>): Promise<CatalogEntry> {
  const supabase =  await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  // Check featured limit if setting to featured
  if (entry.featured) {
    const { data: currentEntry } = await supabase
      .from('catalog_entries')
      .select('featured')
      .eq('id', id)
      .single();
    
    // Only check limit if changing from non-featured to featured
    if (!currentEntry?.featured) {
      const { count: featuredCount } = await supabase
        .from('catalog_entries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', organization.id)
        .eq('featured', true);
      
      // If already at 6 featured entries
      if (featuredCount && featuredCount >= 6) {
        throw new Error('You can only feature up to 6 reptiles. Please unfeature some reptiles first.');
      }
    }
  }

  const { data, error } = await supabase
    .from('catalog_entries')
    .update(entry)
    .eq('id', id)
    .eq('org_id', organization.id)
    .select()
    .single();

  if (error) throw error;
  
  
  return data;
}

// Delete a catalog entry
export async function deleteCatalogEntry(id: string): Promise<void> {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  // First delete associated images
  const { error: imageError } = await supabase
    .from('catalog_images')
    .delete()
    .eq('catalog_entry_id', id);

  if (imageError) throw imageError;

  // Then delete the catalog entry
  const { error } = await supabase
    .from('catalog_entries')
    .delete()
    .eq('id', id)
    .eq('org_id', organization.id); 

  if (error) throw error;
  
  
}

// Add a catalog image
export async function addCatalogImage(image: NewCatalogImage): Promise<CatalogImage> {
  const supabase =  await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  // Check if entry belongs to user
  const { data: entry } = await supabase
    .from('catalog_entries')
    .select('org_id')
    .eq('id', image.catalog_entry_id)
    .single();

  if (!entry ) {
    throw new Error('No entry found for this image');
  }
  if (entry.org_id.toString() !== organization.id?.toString()) {
    throw new Error('Failed to add image: Unauthorized');
  }

  // Check image limit (3 per reptile)
  const { count } = await supabase
    .from('catalog_images')
    .select('*', { count: 'exact', head: true })
    .eq('catalog_entry_id', image.catalog_entry_id);

  if (count && count >= 3) {
    throw new Error('You can only add up to 3 images per reptile.');
  }

  const { data, error } = await supabase
    .from('catalog_images')
    .insert(image)
    .select()
    .single();

  if (error) throw error;
  
  
  return data;
}

// Delete a catalog image
export async function deleteCatalogImage(id: string): Promise<void> {
  const supabase =  await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  // Check if image belongs to user
  const { data: image } = await supabase
    .from('catalog_images')
    .select('catalog_entry_id')
    .eq('id', id)
    .single();

  if (!image) throw new Error('Image not found');

  const { data: entry } = await supabase
    .from('catalog_entries')
    .select('org_id')
    .eq('id', image.catalog_entry_id)
    .single();

  if (!entry || (entry.org_id !== organization.id)) {
    throw new Error('Unauthorized');
  }

  // Delete the image from storage
  const { data: imageData } = await supabase
    .from('catalog_images')
    .select('image_path')
    .eq('id', id)
    .single();

  if (imageData?.image_path) {
    const { error: storageError } = await supabase.storage
      .from('catalog-images')
      .remove([imageData.image_path]);

    if (storageError) throw storageError;
  }

  // Delete from database
  const { error } = await supabase
    .from('catalog_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  
}

// Get catalog settings
export async function getCatalogSettings(): Promise<CatalogSettings> {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('catalog_settings')
    .select('*')
    .eq('org_id', organization.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  
  // If no settings exist, create default settings
  if (!data) {
    const defaultSettings: NewCatalogSettings = {
      org_id: organization.id,
      bio: null,
      show_bio: false,
      layout_type: 'grid',
      contacts: null,
      address: null,
      about: null
    };
    
    const { data: newSettings, error: createError } = await supabase
      .from('catalog_settings')
      .insert(defaultSettings)
      .select()
      .single();
      
    if (createError) throw createError;
    return newSettings;
  }
  
  return data;
}

// Update catalog settings
export async function updateCatalogSettings(settings: Partial<NewCatalogSettings>): Promise<CatalogSettings> {
  const supabase =  await createClient()
  const { organization } = await getUserAndOrganizationInfo()
  if (!organization) throw new Error('Unauthorized');

  // Check if settings exist
  const { data: existingSettings } = await supabase
    .from('catalog_settings')
    .select('id')
    .eq('org_id', organization.id)
    .single();

  if (!existingSettings) {
    // Create new settings
    const newSettings: NewCatalogSettings = {
      org_id: organization.id,
      bio: settings.bio || null,
      show_bio: settings.show_bio || false,
      layout_type: settings.layout_type || 'grid',
      contacts: settings.contacts || null,
      address: settings.address || null,
      about: settings.about || null
    };
    
    const { data, error } = await supabase
      .from('catalog_settings')
      .insert(newSettings)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } else {
    // Update existing settings
    const { data, error } = await supabase
      .from('catalog_settings')
      .update(settings)
      .eq('org_id', organization.id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  }
}