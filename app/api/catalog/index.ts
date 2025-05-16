'use server'
import { CatalogEntry, CatalogImage, CatalogSettings, NewCatalogEntry, NewCatalogImage, NewCatalogSettings } from '@/lib/types/catalog';
import { createClient } from '@/lib/supabase/server'

// Get all catalog entries for the current user
export async function getCatalogEntries(): Promise<CatalogEntry[]> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get catalog entries by profile name (public)
export async function getCatalogEntriesByProfileName(profileName: string): Promise<CatalogEntry[]> {
  const supabase = await createClient()

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('profile_name', profileName)
    .single();

  if (profileError) throw profileError;
  if (!profileData) throw new Error('Profile not found');

  const { data, error } = await supabase
    .from('catalog_entries')
    .select(`
      *,
      reptiles:reptile_id(*),
      catalog_images(*)
    `)
    .eq('user_id', profileData.id)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Create a new catalog entry
export async function createCatalogEntry(entry: NewCatalogEntry): Promise<CatalogEntry> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser) throw new Error('Unauthorized');

  // Check if user is at limit (30 for trial users)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
  
  const { count } = await supabase
    .from('catalog_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  // If trial user and at limit
  if (profile?.subscription_tier === 'trial' && count && count >= 30) {
    throw new Error('Trial users are limited to 30 reptiles in catalog. Please upgrade your account.');
  }

  // Count featured entries
  if (entry.featured) {
    const { count: featuredCount } = await supabase
      .from('catalog_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
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
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  
  return data;
}

// Update a catalog entry
export async function updateCatalogEntry(id: string, entry: Partial<NewCatalogEntry>): Promise<CatalogEntry> {
  const supabase =  await createClient()
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser) throw new Error('Unauthorized');

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
        .eq('user_id', userId)
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
    .eq('user_id', userId) // Security: ensure user owns this entry
    .select()
    .single();

  if (error) throw error;
  
  
  return data;
}

// Delete a catalog entry
export async function deleteCatalogEntry(id: string): Promise<void> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser) throw new Error('Unauthorized');

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
    .eq('user_id', userId); // Security: ensure user owns this entry

  if (error) throw error;
  
  
}

// Get catalog images for an entry
export async function getCatalogImages(entryId: string): Promise<CatalogImage[]> {
  const supabase =  await createClient()
  const currentUser = await supabase.auth.getUser();
  if (!currentUser) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('catalog_images')
    .select('*')
    .eq('catalog_entry_id', entryId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Add a catalog image
export async function addCatalogImage(image: NewCatalogImage): Promise<CatalogImage> {
  const supabase =  await createClient()
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser) throw new Error('Unauthorized');

  // Check if entry belongs to user
  const { data: entry } = await supabase
    .from('catalog_entries')
    .select('user_id')
    .eq('id', image.catalog_entry_id)
    .single();

  if (!entry ) {
    throw new Error('No entry found for this image');
  }
  if (entry.user_id.toString() !== userId?.toString()) {
    console.log('currentUser:', currentUser);
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
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser) throw new Error('Unauthorized');

  // Check if image belongs to user
  const { data: image } = await supabase
    .from('catalog_images')
    .select('catalog_entry_id')
    .eq('id', id)
    .single();

  if (!image) throw new Error('Image not found');

  const { data: entry } = await supabase
    .from('catalog_entries')
    .select('user_id')
    .eq('id', image.catalog_entry_id)
    .single();

  if (!entry || entry.user_id !== userId) {
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
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser || !userId) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('catalog_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  
  // If no settings exist, create default settings
  if (!data) {
    const defaultSettings: NewCatalogSettings = {
      user_id: userId ,
      bio: null,
      show_bio: false,
      layout_type: 'grid'
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
  const currentUser = await supabase.auth.getUser();
  const userId = currentUser.data.user?.id;
  if (!currentUser ||!userId) throw new Error('Unauthorized');

  // Check if settings exist
  const { data: existingSettings } = await supabase
    .from('catalog_settings')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!existingSettings) {
    // Create new settings
    const newSettings: NewCatalogSettings = {
      user_id: userId,
      bio: settings.bio || null,
      show_bio: settings.show_bio || false,
      layout_type: settings.layout_type || 'grid'
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
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  }
} 