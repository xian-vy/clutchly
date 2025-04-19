import { createClient } from '@/lib/supabase/client';
import { FeedingEvent, FeedingEventWithDetails, NewFeedingEvent } from '@/lib/types/feeding';

// Get feeding events for a specific schedule
export async function getFeedingEvents(scheduleId: string): Promise<FeedingEventWithDetails[]> {
  const supabase = createClient();
  
  // Get feeding events
  const { data: events, error } = await supabase
    .from('feeding_events')
    .select('*')
    .eq('schedule_id', scheduleId)
    .order('scheduled_date', { ascending: false });
  
  if (error) throw error;
  if (!events || events.length === 0) return [];
  
  // Get reptile details for the events
  const reptileIds = events.map(event => event.reptile_id);
  
  const { data: reptiles, error: reptilesError } = await supabase
    .from('reptiles')
    .select('id, name, species_id, morph_id')
    .in('id', reptileIds);
  
  if (reptilesError) throw reptilesError;
  if (!reptiles) return events.map(event => ({ 
    ...event, 
    reptile_name: 'Unknown', 
    species_name: 'Unknown', 
    morph_name: 'Unknown' 
  }));
  
  // Get species and morphs for the reptiles
  const speciesIds = reptiles.map(reptile => reptile.species_id).filter(Boolean);
  const morphIds = reptiles.map(reptile => reptile.morph_id).filter(Boolean);
  
  let species: any[] = [];
  let morphs: any[] = [];
  
  if (speciesIds.length > 0) {
    const { data: speciesData, error: speciesError } = await supabase
      .from('species')
      .select('id, name')
      .in('id', speciesIds);
    
    if (!speciesError && speciesData) {
      species = speciesData;
    }
  }
  
  if (morphIds.length > 0) {
    const { data: morphsData, error: morphsError } = await supabase
      .from('morphs')
      .select('id, name')
      .in('id', morphIds);
    
    if (!morphsError && morphsData) {
      morphs = morphsData;
    }
  }
  
  // Create lookup maps
  const reptileMap = reptiles.reduce((acc: Record<string, any>, reptile: any) => {
    acc[reptile.id] = reptile;
    return acc;
  }, {});
  
  const speciesMap = species.reduce((acc: Record<string, string>, species: any) => {
    acc[species.id] = species.name;
    return acc;
  }, {});
  
  const morphMap = morphs.reduce((acc: Record<string, string>, morph: any) => {
    acc[morph.id] = morph.name;
    return acc;
  }, {});
  
  // Combine data
  return events.map(event => {
    const reptile = reptileMap[event.reptile_id];
    return {
      ...event,
      reptile_name: reptile?.name || 'Unknown',
      species_name: reptile?.species_id ? speciesMap[reptile.species_id] || 'Unknown' : 'Unknown',
      morph_name: reptile?.morph_id ? morphMap[reptile.morph_id] || 'Unknown' : 'Unknown'
    };
  });
}

// Create a new feeding event
export async function createFeedingEvent(data: NewFeedingEvent): Promise<FeedingEvent> {
  const supabase = createClient();
  
  const { data: event, error } = await supabase
    .from('feeding_events')
    .insert([data])
    .select()
    .single();
  
  if (error) throw error;
  if (!event) throw new Error('Failed to create feeding event');
  
  return event;
}

// Create multiple feeding events
export async function createFeedingEvents(events: NewFeedingEvent[]): Promise<FeedingEvent[]> {
  if (events.length === 0) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('feeding_events')
    .insert(events)
    .select();
  
  if (error) throw error;
  
  return data || [];
}

// Update a feeding event (mark as fed)
export async function updateFeedingEvent(id: string, data: Partial<NewFeedingEvent>): Promise<FeedingEvent> {
  const supabase = createClient();
  
  const { data: event, error } = await supabase
    .from('feeding_events')
    .update({
      fed: data.fed ?? false,
      fed_at: data.fed ? new Date().toISOString() : null,
      notes: data.notes
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!event) throw new Error('Failed to update feeding event');
  
  return event;
}

// Delete a feeding event
export async function deleteFeedingEvent(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('feeding_events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Generate feeding events for a schedule
export async function generateFeedingEvents(scheduleId: string, startDate: string, endDate: string): Promise<FeedingEvent[]> {
  const supabase = createClient();
  
  // Get schedule details
  const { data: schedule, error: scheduleError } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();
  
  if (scheduleError) throw scheduleError;
  if (!schedule) throw new Error('Schedule not found');
  
  // Get feeding targets
  const { data: targets, error: targetsError } = await supabase
    .from('feeding_targets')
    .select('*')
    .eq('schedule_id', scheduleId);
  
  if (targetsError) throw targetsError;
  if (!targets || targets.length === 0) throw new Error('No feeding targets found');
  
  // Get all reptiles that should be fed
  let reptileIds: string[] = [];
  
  // Directly add reptile targets
  const reptileTargets = targets.filter(t => t.target_type === 'reptile');
  reptileIds = reptileIds.concat(reptileTargets.map(t => t.target_id));
  
  // Get reptiles from location targets
  const locationTargets = targets.filter(t => t.target_type === 'location');
  const locationIds = locationTargets.map(t => t.target_id);
  
  if (locationIds.length > 0) {
    const { data: reptiles, error: reptilesError } = await supabase
      .from('reptiles')
      .select('id')
      .in('location_id', locationIds)
      .eq('status', 'active'); // Only active reptiles
    
    if (reptilesError) throw reptilesError;
    if (reptiles) {
      reptileIds = reptileIds.concat(reptiles.map(r => r.id));
    }
  }
  
  // Remove duplicates
  reptileIds = [...new Set(reptileIds)];
  
  if (reptileIds.length === 0) {
    throw new Error('No reptiles found for the selected targets');
  }
  
  // Generate dates based on recurrence
  const dates = generateDates(schedule.recurrence, schedule.custom_days, startDate, endDate);
  
  // Create feeding events
  const events: NewFeedingEvent[] = [];
  
  for (const date of dates) {
    for (const reptileId of reptileIds) {
      events.push({
        schedule_id: scheduleId,
        reptile_id: reptileId,
        scheduled_date: date,
        fed: false,
        fed_at: null,
        notes: null
      });
    }
  }
  
  // Save events to database
  if (events.length === 0) return [];
  
  const { data, error } = await supabase
    .from('feeding_events')
    .insert(events)
    .select();
  
  if (error) throw error;
  
  return data || [];
}

// Helper function to generate dates based on recurrence
function generateDates(recurrence: string, customDays: number[] | null, startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Adjust to midnight for consistent date comparisons
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    
    let shouldAddDate = false;
    
    switch (recurrence) {
      case 'daily':
        shouldAddDate = true;
        break;
      case 'weekly':
        // Weekly recurrence uses the day of the week from the start date
        shouldAddDate = dayOfWeek === start.getDay();
        break;
      case 'custom':
        shouldAddDate = customDays?.includes(dayOfWeek) || false;
        break;
    }
    
    if (shouldAddDate) {
      dates.push(current.toISOString().split('T')[0]);
    }
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
} 