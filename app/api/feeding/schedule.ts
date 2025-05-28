import { createClient } from '@/lib/supabase/client';
import { FeedingTarget, NewFeedingSchedule, FeedingScheduleWithTargets, TargetType } from '@/lib/types/feeding';
import { getUserAndOrganizationInfo } from '../utils_client';

// Get all feeding schedules for the current user
export async function getFeedingSchedules(): Promise<FeedingScheduleWithTargets[]> {
  const supabase = await createClient();
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) throw new Error('Not authenticated');
  
  // Get all feeding schedules
  const { data: schedules, error } = await supabase
    .from('feeding_schedules')
    .select('*')
    .eq('org_id', organization.id)
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
  const targetsBySchedule = enrichedTargets.reduce((acc: Record<string, FeedingTarget[]>, target) => {
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

// Enrich targets with details (reptile name, location label, room name, rack name, level number)
async function enrichTargets(targets: FeedingTarget[]): Promise<FeedingTarget[]> {
  if (targets.length === 0) return [];
  
  const supabase = await createClient();
  
  // Separate targets by type
  const reptileTargets = targets.filter(t => t.target_type === 'reptile');
  const locationTargets = targets.filter(t => t.target_type === 'location');
  const roomTargets = targets.filter(t => t.target_type === 'room');
  const rackTargets = targets.filter(t => t.target_type === 'rack');
  const levelTargets = targets.filter(t => t.target_type === 'level');
  
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
  
  // Get room details
  const roomIds = roomTargets.map(t => t.target_id);
  let roomData: Record<string, string> = {};
  
  if (roomIds.length > 0) {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, name')
      .in('id', roomIds);
    
    if (!error && rooms) {
      roomData = rooms.reduce((acc: Record<string, string>, room: { id: string; name: string }) => {
        acc[room.id] = room.name;
        return acc;
      }, {});
    }
  }
  
  // Get rack details
  const rackIds = rackTargets.map(t => t.target_id);
  let rackData: Record<string, string> = {};
  
  if (rackIds.length > 0) {
    const { data: racks, error } = await supabase
      .from('racks')
      .select('id, name')
      .in('id', rackIds);
    
    if (!error && racks) {
      rackData = racks.reduce((acc: Record<string, string>, rack: { id: string; name: string }) => {
        acc[rack.id] = rack.name;
        return acc;
      }, {});
    }
  }
  
  // Process level targets (these use a composite ID format: "rackId-levelNumber")
  const levelData: Record<string, { rack_name: string, level_number: string | number }> = {};
  
  if (levelTargets.length > 0) {
    // Extract rack IDs from composite level IDs (format: "rackId-levelNumber")
    const rackIdsFromLevels = [...new Set(levelTargets.map(t => t.target_id.split('-')[0]))];
    
    // Get rack names for these IDs
    if (rackIdsFromLevels.length > 0) {
      const { data: levelRacks, error } = await supabase
        .from('racks')
        .select('id, name')
        .in('id', rackIdsFromLevels);
      
      if (!error && levelRacks) {
        const levelRackData = levelRacks.reduce((acc: Record<string, string>, rack: { id: string; name: string }) => {
          acc[rack.id] = rack.name;
          return acc;
        }, {});
        
        // Build level data with rack name and level number
        levelTargets.forEach(target => {
          const [rackId, levelNumber] = target.target_id.split('-');
          levelData[target.target_id] = {
            rack_name: levelRackData[rackId] || 'Unknown Rack',
            level_number: levelNumber
          };
        });
      }
    }
  }
  
  // Combine targets with details
  return targets.map(target => {
    if (target.target_type === 'reptile') {
      return {
        ...target,
        reptile_name: reptileData[target.target_id] || 'Unknown'
      };
    } else if (target.target_type === 'location') {
      return {
        ...target,
        location_label: locationData[target.target_id] || 'Unknown'
      };
    } else if (target.target_type === 'room') {
      return {
        ...target,
        room_name: roomData[target.target_id] || 'Unknown'
      };
    } else if (target.target_type === 'rack') {
      return {
        ...target,
        rack_name: rackData[target.target_id] || 'Unknown'
      };
    } else if (target.target_type === 'level') {
      const levelInfo = levelData[target.target_id] || { rack_name: 'Unknown', level_number: 'Unknown' };
      return {
        ...target,
        rack_name: levelInfo.rack_name,
        level_number: levelInfo.level_number
      };
    } else {
      return target;
    }
  });
}

// Create a new feeding schedule
async function checkExistingTargets(targets: { target_type: TargetType; target_id: string }[]): Promise<string[]> {
  const supabase = await createClient();
  const existingTargets: string[] = [];

  for (const target of targets) {
    const { data, error } = await supabase
      .from('feeding_targets')
      .select('id, schedule_id')
      .eq('target_type', target.target_type)
      .eq('target_id', target.target_id);

    if (error) throw error;
    if (data && data.length > 0) {
      existingTargets.push(target.target_id);
    }
  }

  return existingTargets;
}

export async function createFeedingSchedule(data: NewFeedingSchedule & { targets: { target_type: TargetType; target_id: string }[] }): Promise<FeedingScheduleWithTargets> {
  const supabase = await createClient();
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) throw new Error('Not authenticated');

  // Check for existing targets first
  const existingTargets = await checkExistingTargets(data.targets);
  if (existingTargets.length > 0) {
    const error = new Error('Some targets are already in other feeding schedules!');
    error.name = 'Custom';
    throw error;
  }

  // Extract targets from data
  const { targets, ...scheduleData } = data;
  
  // 1. Create the schedule
  const { data: schedule, error } = await supabase
    .from('feeding_schedules')
    .insert([
      {
        ...scheduleData,
        org_id: organization.id
      }
    ])
    .select()
    .single();
  
  if (error) throw error;
  if (!schedule) throw new Error('Failed to create feeding schedule');
  console.log('Schedule created:', schedule);
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
  
  
  // 5. Return the schedule with targets
  return {
    ...schedule,
    targets: enrichedTargets
  };
}

// Update an existing feeding schedule
export async function updateFeedingSchedule(
  id: string,
  data: NewFeedingSchedule & { targets: { target_type: TargetType, target_id: string }[] }
): Promise<FeedingScheduleWithTargets> {
  const supabase = await createClient();
  
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
      interval_days: scheduleData.interval_days,
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
  const supabase = await createClient();
  
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