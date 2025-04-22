'use server'
import { createClient } from '@/lib/supabase/server';
import { FeedingEvent, FeedingEventWithDetails, NewFeedingEvent } from '@/lib/types/feeding';
import { Morph } from '@/lib/types/morph';
import { Species } from '@/lib/types/species';
import { startOfDay } from 'date-fns';

// Get feeding events for a specific schedule
export async function getFeedingEvents(scheduleId: string): Promise<FeedingEventWithDetails[]> {
  const supabase = await createClient();
  
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
  
  let species: Species[] = [];
  let morphs: Morph[] = [];
  
  if (speciesIds.length > 0) {
    const { data: speciesData, error: speciesError } = await supabase
      .from('species')
      .select('id, name')
      .in('id', speciesIds);
    
    if (!speciesError && speciesData) {
      species = speciesData as Species[];
    }
  }
  
  if (morphIds.length > 0) {
    const { data: morphsData, error: morphsError } = await supabase
      .from('morphs')
      .select('id, name')
      .in('id', morphIds);
    
    if (!morphsError && morphsData) {
      morphs = morphsData as Morph[];
    }
  }
  
  // Create lookup maps
  const reptileMap = reptiles.reduce((acc: Record<string, typeof reptiles[0]>, reptile) => {
    acc[reptile.id] = reptile;
    return acc;
  }, {});
  
  const speciesMap = species.reduce((acc: Record<string, string>, species: Species) => {
    acc[species.id] = species.name;
    return acc;
  }, {});
  
  const morphMap = morphs.reduce((acc: Record<string, string>, morph: Morph) => {
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
  const supabase = await createClient();
  
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
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('feeding_events')
    .insert(events)
    .select();
  
  if (error) throw error;
  
  return data || [];
}

// Update a feeding event (mark as fed)
export async function updateFeedingEvent(id: string, data: Partial<NewFeedingEvent>): Promise<FeedingEvent> {
  const supabase =  await createClient();
  
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
  const supabase =  await createClient();
  
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
  const supabase = await createClient();
  
  // Get the schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();
  
  if (scheduleError) throw scheduleError;
  if (!schedule) throw new Error('Schedule not found');
  
  // Get targets for this schedule
  const { data: targets, error: targetsError } = await supabase
    .from('feeding_targets')
    .select('*')
    .eq('schedule_id', scheduleId);
  
  if (targetsError) throw targetsError;
  if (!targets || targets.length === 0) {
    throw new Error('No targets found for this schedule');
  }
  
  // Get reptiles from targets
  const reptileIds = await getReptilesFromTargets(targets);
  if (reptileIds.length === 0) {
    throw new Error('No reptiles found for this schedule');
  }
  
  // Determine start and end dates
  const actualStartDate = startDate || schedule.start_date;
  const actualEndDate = endDate || schedule.end_date || generateDefaultEndDate(actualStartDate);
  
  // Generate feeding dates based on recurrence pattern
  const feedingDates = generateFeedingDates(
    schedule.recurrence,
    schedule.custom_days || [],
    schedule.interval_days,
    actualStartDate,
    actualEndDate
  );
  
  // Get user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
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
  const supabase = await createClient();
  const reptileIds: string[] = [];

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
  intervalDays: number | null,
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
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
    }
  }
  // Custom days recurrence
  else if (recurrence === 'custom' && customDays.length > 0) {
    // For each custom day, find all occurrences between start and end dates
    for (const dayOfWeek of customDays) {
      // Find the first occurrence of this day after the start date
      const firstDate = new Date(start);
      const daysToAdd = (dayOfWeek - firstDate.getDay() + 7) % 7;
      firstDate.setDate(firstDate.getDate() + daysToAdd);
      
      // If the first occurrence is after the end date, skip this day
      if (firstDate > end) continue;
      
      // Add all occurrences of this day between start and end dates
      const current = new Date(firstDate);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 7);
      }
    }
    
    // Sort dates to ensure they're in chronological order
    dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }
  // Interval-based recurrence
  else if (recurrence === 'interval' && intervalDays && intervalDays > 0) {
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + intervalDays);
    }
  }
  
  return dates;
}

// Check every reptile update (if location_id has value)
export async function createFeedingEventForNewLocation(reptileId: string, locationId: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log(`Server: Starting with location : ${locationId}`);
  
  // Get location details including room and rack information
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select(`
      *,
      rooms:room_id (id, name),
      racks:rack_id (id, name, type)
    `)
    .eq('id', locationId)
    .single();

  if (locationError) {
    console.error('Error fetching location:', locationError);
    return;
  }

  if (!location) {
    console.error(`No location found for ID: ${locationId}`);
    return;
  }

  console.log('Server: Found location:', location);

  // Build target conditions with proper room reference
  const targetIds = [
    locationId,
    location.racks?.id,
    location.rooms?.id
  ].filter(Boolean); // Remove any undefined values

  if (targetIds.length === 0) {
    console.log(`Server: No valid target IDs for location ${locationId}`);
    return;
  }

  // Create the level target ID separately
  const levelTargetId = location.racks?.id && location.shelf_level ? 
    `${location.racks.id}-${location.shelf_level}` : null;

  // Query for feeding targets that match our location or its parents
  const targetsQuery = supabase
    .from('feeding_targets')
    .select('schedule_id, target_type, target_id')
    .or(`target_type.eq.location,target_type.eq.rack,target_type.eq.room`)
    .in('target_id', targetIds);

  console.log(`Looking for targets with IDs: ${targetIds.join(', ')}`);

  // Add level targets separately if we have a valid level target ID
  if (levelTargetId) {
    // Query for all level targets
    const { data: allLevelTargets, error: levelError } = await supabase
      .from('feeding_targets')
      .select('schedule_id, target_type, target_id')
      .eq('target_type', 'level');
    
    console.log(`Found ${allLevelTargets?.length || 0} level targets, looking for: ${levelTargetId}`);
    
    if (levelError) {
      console.error('Error fetching level targets:', levelError);
    } else if (allLevelTargets && allLevelTargets.length > 0) {
      // Filter level targets in memory to match our level target ID
      const matchingLevelTargets = allLevelTargets.filter(
        target => target.target_id === levelTargetId
      );
      
      console.log(`Found ${matchingLevelTargets.length} matching level targets for: ${levelTargetId}`);
      
      if (matchingLevelTargets.length > 0) {
        // Combine the results
        const { data: regularTargets, error: regularError } = await targetsQuery;
        
        if (regularError) {
          console.error('Error fetching regular targets:', regularError);
          return;
        }
        
        // Combine both sets of targets
        const combinedTargets = [
          ...(regularTargets || []),
          ...matchingLevelTargets
        ];
        
        // Continue with the combined targets
        await processTargets(combinedTargets, reptileId, locationId);
        return;
      }
    }
  }

  const { data: targets, error: targetsError } = await targetsQuery;

  if (targetsError) {
    console.error('Error fetching feeding targets:', targetsError);
    return;
  }

  console.log(`Found ${targets?.length || 0} regular targets for location ${locationId}`);

  if (!targets || targets.length === 0) {
    console.log(`Server: No feeding targets found for location ${locationId} or its parents`);
    return;
  }

  // Process the targets
  await processTargets(targets, reptileId, locationId);
}

// Helper function to process targets and create feeding events
async function processTargets(
  targets: { schedule_id: string; target_type: string; target_id: string }[], 
  reptileId: string, 
  locationId: string
): Promise<void> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check each schedule
  for (const target of targets) {
    // Get schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from('feeding_schedules')
      .select('*')
      .eq('id', target.schedule_id)
      .single();

    if (scheduleError || !schedule) {
      console.error(`Error fetching schedule ${target.schedule_id}:`, scheduleError);
      continue;
    }

    console.log(`Processing schedule: ${schedule.id}, recurrence: ${schedule.recurrence}, start_date: ${schedule.start_date}`);

    // Check if today is a feeding day based on schedule pattern
    let isFeedingDay = false;
    const todayDate = today.toISOString().split('T')[0];
    const scheduleStart = startOfDay(new Date(schedule.start_date));
    
    if (schedule.recurrence === 'daily') {
      isFeedingDay = today >= scheduleStart;
    } else if (schedule.recurrence === 'weekly') {
      // For weekly schedules, check if today is within the same week as the start date
      // and if today is after or equal to the start date
      const startDayOfWeek = scheduleStart.getDay();
      const todayDayOfWeek = today.getDay();
      
      // Calculate days since schedule start
      const daysSinceStart = Math.floor((today.getTime() - scheduleStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // For weekly schedules, we want to create events for any day in the week
      // that's after or equal to the start date
      isFeedingDay = daysSinceStart >= 0;
      
      console.log(`Weekly schedule check: startDay=${startDayOfWeek}, todayDay=${todayDayOfWeek}, daysSinceStart=${daysSinceStart}, isFeedingDay=${isFeedingDay}, startDate=${schedule.start_date}, today=${today.toISOString()}`);
    } else if (schedule.recurrence === 'custom' && schedule.custom_days) {
      const todayDay = today.getDay();
      isFeedingDay = schedule.custom_days.includes(todayDay) && today >= scheduleStart;
    }

    if (isFeedingDay) {
      console.log(`Server: Found feeding schedule for reptile ${reptileId} at ${locationId}`);
      
      // Check if event already exists for this reptile today
      const { data: existingEvent } = await supabase
        .from('feeding_events')
        .select('id')
        .eq('schedule_id', target.schedule_id)
        .eq('reptile_id', reptileId)
        .eq('scheduled_date', todayDate)
        .maybeSingle();

      if (!existingEvent) {
        // Check if all other events for this schedule and date are fed
        const { data: otherEvents } = await supabase
          .from('feeding_events')
          .select('fed')
          .eq('schedule_id', target.schedule_id)
          .eq('scheduled_date', todayDate)
          .neq('reptile_id', reptileId);
        
        // Set fed to true if all other events are fed, otherwise false
        const allOtherEventsFed = otherEvents && otherEvents.length > 0 && 
          otherEvents.every(event => event.fed);
        
        // Create a new event for this reptile
        const newEvent: NewFeedingEvent = {
          schedule_id: target.schedule_id,
          reptile_id: reptileId,
          scheduled_date: todayDate,
          fed: allOtherEventsFed || false,
          fed_at: allOtherEventsFed ? new Date().toISOString() : null,
          notes: null
        };

        await createFeedingEvent(newEvent);
      }
    } else {
      console.log(`Server: No feeding schedules found for reptile ${reptileId} at ${locationId}`);
    }
  }
}