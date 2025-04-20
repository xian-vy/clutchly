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
export async function generateEventsFromSchedule(
  scheduleId: string,
  startDate: string,
  endDate?: string | null
): Promise<{ count: number }> {
  const supabase = createClient();
  
  // Get user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // 1. Get the schedule details
  const { data: schedule, error: scheduleError } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('id', scheduleId)
    .eq('user_id', user.id)
    .single();
  
  if (scheduleError) throw scheduleError;
  if (!schedule) throw new Error('Schedule not found');
  
  // 2. Get schedule targets
  const { data: targets, error: targetsError } = await supabase
    .from('feeding_targets')
    .select('*')
    .eq('schedule_id', scheduleId);
  
  if (targetsError) throw targetsError;
  if (!targets || targets.length === 0) {
    return { count: 0 }; // No targets to generate events for
  }
  
  // 3. Get reptile IDs based on targets
  const reptileIds = await getReptilesFromTargets(targets);
  
  if (reptileIds.length === 0) {
    return { count: 0 }; // No reptiles to generate events for
  }
  
  // 4. Generate dates based on recurrence pattern
  // Use provided date range, or fallback to schedule's start/end dates
  const actualStartDate = startDate || schedule.start_date;
  const actualEndDate = endDate || schedule.end_date || generateDefaultEndDate(actualStartDate);
  
  const feedingDates = generateFeedingDates(
    schedule.recurrence,
    schedule.custom_days || [],
    actualStartDate,
    actualEndDate
  );
  
  if (feedingDates.length === 0) {
    return { count: 0 }; // No dates to generate events for
  }
  
  // 5. Generate events (one per reptile per date)
  const events = [];
  
  for (const reptileId of reptileIds) {
    for (const date of feedingDates) {
      // Check if event already exists
      const { data: existingEvent } = await supabase
        .from('feeding_events')
        .select('id')
        .eq('reptile_id', reptileId)
        .eq('schedule_id', scheduleId)
        .eq('scheduled_date', date)
        .maybeSingle();
      
      if (!existingEvent) {
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
  }
  
  // 6. Insert events
  if (events.length > 0) {
    const { error: insertError } = await supabase
      .from('feeding_events')
      .insert(events);
    
    if (insertError) throw insertError;
  }
  
  return { count: events.length };
}

// Helper function to get reptiles from targets
async function getReptilesFromTargets(targets: { target_type: string; target_id: string }[]): Promise<string[]> {
  const supabase = createClient();
  let reptileIds: string[] = [];

  // Extract targets by type
  const reptileTargets = targets.filter(t => t.target_type === 'reptile').map(t => t.target_id);
  const locationTargets = targets.filter(t => t.target_type === 'location').map(t => t.target_id);
  const roomTargets = targets.filter(t => t.target_type === 'room').map(t => t.target_id);
  const rackTargets = targets.filter(t => t.target_type === 'rack').map(t => t.target_id);
  const levelTargets = targets.filter(t => t.target_type === 'level');
  
  // Add direct reptile targets
  if (reptileTargets.length > 0) {
    reptileIds.push(...reptileTargets);
  }
  
  // Get reptiles from locations
  if (locationTargets.length > 0) {
    const { data: reptiles, error } = await supabase
      .from('reptiles')
      .select('id')
      .in('location_id', locationTargets);
    
    if (!error && reptiles) {
      reptileIds.push(...reptiles.map(r => r.id));
    }
  }
  
  // Get reptiles from rooms
  if (roomTargets.length > 0) {
    // First get all locations in these rooms
    const { data: locationsInRooms, error: locationsError } = await supabase
      .from('locations')
      .select('id')
      .in('room_id', roomTargets);
    
    if (!locationsError && locationsInRooms && locationsInRooms.length > 0) {
      // Then get reptiles in those locations
      const locationIds = locationsInRooms.map(loc => loc.id);
      
      const { data: reptiles, error } = await supabase
        .from('reptiles')
        .select('id')
        .in('location_id', locationIds);
      
      if (!error && reptiles) {
        reptileIds.push(...reptiles.map(r => r.id));
      }
    }
  }
  
  // Get reptiles from racks
  if (rackTargets.length > 0) {
    // First get all locations in these racks
    const { data: locationsInRacks, error: locationsError } = await supabase
      .from('locations')
      .select('id')
      .in('rack_id', rackTargets);
    
    if (!locationsError && locationsInRacks && locationsInRacks.length > 0) {
      // Then get reptiles in those locations
      const locationIds = locationsInRacks.map(loc => loc.id);
      
      const { data: reptiles, error } = await supabase
        .from('reptiles')
        .select('id')
        .in('location_id', locationIds);
      
      if (!error && reptiles) {
        reptileIds.push(...reptiles.map(r => r.id));
      }
    }
  }
  
  // Get reptiles from rack levels (format: "rackId-levelNumber")
  if (levelTargets.length > 0) {
    // Group level targets by rack to optimize queries
    const levelsByRack: Record<string, (string | number)[]> = {};
    
    levelTargets.forEach(target => {
      const [rackId, levelNumber] = target.target_id.split('-');
      levelsByRack[rackId] = levelsByRack[rackId] || [];
      levelsByRack[rackId].push(levelNumber);
    });
    
    for (const [rackId, levels] of Object.entries(levelsByRack)) {
      // Get locations for this rack at the specified levels
      const { data: locationsAtLevels, error: locationsError } = await supabase
        .from('locations')
        .select('id')
        .eq('rack_id', rackId)
        .in('shelf_level', levels);
      
      if (!locationsError && locationsAtLevels && locationsAtLevels.length > 0) {
        // Get reptiles in those locations
        const locationIds = locationsAtLevels.map(loc => loc.id);
        
        const { data: reptiles, error } = await supabase
          .from('reptiles')
          .select('id')
          .in('location_id', locationIds);
        
        if (!error && reptiles) {
          reptileIds.push(...reptiles.map(r => r.id));
        }
      }
    }
  }
  
  // Remove duplicates and return unique reptile IDs
  return [...new Set(reptileIds)];
}

// Generate default end date (30 days after start date)
function generateDefaultEndDate(startDate: string): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

// Generate feeding dates based on recurrence pattern
function generateFeedingDates(
  recurrence: string,
  customDays: number[],
  startDate: string,
  endDate: string
): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];
  
  // Set time to midnight to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  // Daily recurrence
  if (recurrence === 'daily') {
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }
  // Weekly recurrence (same day of week as start date)
  else if (recurrence === 'weekly') {
    const dayOfWeek = start.getDay();
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
    }
  }
  // Custom days recurrence
  else if (recurrence === 'custom' && customDays.length > 0) {
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (customDays.includes(dayOfWeek)) {
        dates.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
  }
  
  return dates;
} 