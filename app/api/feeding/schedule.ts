import { createClient } from '@/lib/supabase/client';
import { FeedingSchedule, FeedingTarget, NewFeedingSchedule, FeedingScheduleWithTargets } from '@/lib/types/feeding';

// Get all feeding schedules for the current user
export async function getFeedingSchedules(): Promise<FeedingScheduleWithTargets[]> {
  const supabase = createClient();
  
  // Get user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Get all feeding schedules
  const { data: schedules, error } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  if (!schedules) return [];
  
  // Get all targets for these schedules
  const scheduleIds = schedules.map(schedule => schedule.id);
  
  if (scheduleIds.length === 0) return [];
  
  const { data: targets, error: targetsError } = await supabase
    .from('feeding_targets')
    .select('*')
    .in('schedule_id', scheduleIds);
  
  if (targetsError) throw targetsError;
  
  // Enrich targets with reptile/location details
  const enrichedTargets = await enrichTargets(targets || []);
  
  // Group targets by schedule_id
  const targetsBySchedule = enrichedTargets.reduce((acc: Record<string, any[]>, target) => {
    acc[target.schedule_id] = acc[target.schedule_id] || [];
    acc[target.schedule_id].push(target);
    return acc;
  }, {});
  
  // Combine schedules with their targets
  return schedules.map(schedule => ({
    ...schedule,
    targets: targetsBySchedule[schedule.id] || []
  }));
}

// Enrich targets with details (reptile name or location label)
async function enrichTargets(targets: FeedingTarget[]): Promise<FeedingTarget[]> {
  if (targets.length === 0) return [];
  
  const supabase = createClient();
  
  // Separate targets by type
  const reptileTargets = targets.filter(t => t.target_type === 'reptile');
  const locationTargets = targets.filter(t => t.target_type === 'location');
  
  // Get reptile details
  const reptileIds = reptileTargets.map(t => t.target_id);
  let reptileData: Record<string, string> = {};
  
  if (reptileIds.length > 0) {
    const { data: reptiles, error } = await supabase
      .from('reptiles')
      .select('id, name')
      .in('id', reptileIds);
    
    if (!error && reptiles) {
      reptileData = reptiles.reduce((acc: Record<string, string>, reptile: { id: string; name: string }) => {
        acc[reptile.id] = reptile.name;
        return acc;
      }, {});
    }
  }
  
  // Get location details
  const locationIds = locationTargets.map(t => t.target_id);
  let locationData: Record<string, string> = {};
  
  if (locationIds.length > 0) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, label')
      .in('id', locationIds);
    
    if (!error && locations) {
      locationData = locations.reduce((acc: Record<string, string>, location: { id: string; label: string }) => {
        acc[location.id] = location.label;
        return acc;
      }, {});
    }
  }
  
  // Combine targets with details
  return targets.map(target => {
    if (target.target_type === 'reptile') {
      return {
        ...target,
        reptile_name: reptileData[target.target_id] || 'Unknown'
      };
    } else {
      return {
        ...target,
        location_label: locationData[target.target_id] || 'Unknown'
      };
    }
  });
}

// Create a new feeding schedule
export async function createFeedingSchedule(
  data: NewFeedingSchedule & { targets: { target_type: 'reptile' | 'location', target_id: string }[] }
): Promise<FeedingScheduleWithTargets> {
  const supabase = createClient();
  
  // Get user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Extract targets from data
  const { targets, ...scheduleData } = data;
  
  // 1. Create the schedule
  const { data: schedule, error } = await supabase
    .from('feeding_schedules')
    .insert([
      {
        ...scheduleData,
        user_id: user.id
      }
    ])
    .select()
    .single();
  
  if (error) throw error;
  if (!schedule) throw new Error('Failed to create feeding schedule');
  
  // 2. Create the targets
  const targetData = targets.map(target => ({
    schedule_id: schedule.id,
    target_type: target.target_type,
    target_id: target.target_id
  }));
  
  const { data: createdTargets, error: targetsError } = await supabase
    .from('feeding_targets')
    .insert(targetData)
    .select();
  
  if (targetsError) throw targetsError;
  
  // 3. Enrich targets
  const enrichedTargets = await enrichTargets(createdTargets || []);
  
  // 4. Return the schedule with targets
  return {
    ...schedule,
    targets: enrichedTargets
  };
}

// Update an existing feeding schedule
export async function updateFeedingSchedule(
  id: string,
  data: NewFeedingSchedule & { targets: { target_type: 'reptile' | 'location', target_id: string }[] }
): Promise<FeedingScheduleWithTargets> {
  const supabase = createClient();
  
  // Extract targets from data
  const { targets, ...scheduleData } = data;
  
  // 1. Update the schedule
  const { data: schedule, error } = await supabase
    .from('feeding_schedules')
    .update({
      name: scheduleData.name,
      description: scheduleData.description,
      recurrence: scheduleData.recurrence,
      custom_days: scheduleData.custom_days,
      start_date: scheduleData.start_date,
      end_date: scheduleData.end_date
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  if (!schedule) throw new Error('Failed to update feeding schedule');
  
  // 2. Delete existing targets
  const { error: deleteError } = await supabase
    .from('feeding_targets')
    .delete()
    .eq('schedule_id', id);
  
  if (deleteError) throw deleteError;
  
  // 3. Create new targets
  const targetData = targets.map(target => ({
    schedule_id: id,
    target_type: target.target_type,
    target_id: target.target_id
  }));
  
  const { data: createdTargets, error: targetsError } = await supabase
    .from('feeding_targets')
    .insert(targetData)
    .select();
  
  if (targetsError) throw targetsError;
  
  // 4. Enrich targets
  const enrichedTargets = await enrichTargets(createdTargets || []);
  
  // 5. Return the schedule with targets
  return {
    ...schedule,
    targets: enrichedTargets
  };
}

// Delete a feeding schedule
export async function deleteFeedingSchedule(id: string): Promise<void> {
  const supabase = createClient();
  
  // Delete targets first (foreign key constraint)
  const { error: deleteTargetsError } = await supabase
    .from('feeding_targets')
    .delete()
    .eq('schedule_id', id);
  
  if (deleteTargetsError) throw deleteTargetsError;
  
  // Delete events (foreign key constraint)
  const { error: deleteEventsError } = await supabase
    .from('feeding_events')
    .delete()
    .eq('schedule_id', id);
  
  if (deleteEventsError) throw deleteEventsError;
  
  // Delete the schedule
  const { error } = await supabase
    .from('feeding_schedules')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
} 