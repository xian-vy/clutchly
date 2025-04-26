import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { toast } from 'sonner';
import { createFeedingEvent, updateFeedingEvent } from '@/app/api/feeding/events';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
import { QueryClient } from '@tanstack/react-query';

// Interface for virtual events that don't exist in the DB yet
export interface VirtualFeedingEvent {
  virtual: true;
  reptile_id: string;
  scheduled_date: string;
  reptile_name: string;
  species_name: string;
  morph_name: string;
}

// Determine if feeding should happen today based on schedule
export const shouldHaveFeedingToday = (schedule: FeedingScheduleWithTargets): boolean => {
  const today = new Date();
  const startDate = new Date(schedule.start_date);
  const endDate = schedule.end_date ? new Date(schedule.end_date) : null;
  
  // Set all dates to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(0, 0, 0, 0);
  
  // Basic date range check
  if (today < startDate || (endDate && today > endDate)) {
    return false;
  }

  switch (schedule.recurrence) {
    case 'daily':
      return true;

    case 'weekly': {
      // For weekly schedules, check if today's day of week matches the start date's day of week
      const startDayOfWeek = startDate.getDay();
      const todayDayOfWeek = today.getDay();
      return startDayOfWeek === todayDayOfWeek;
    }

    case 'custom': {
      if (!schedule.custom_days || schedule.custom_days.length === 0) return false;
      
      // Check if today's day of week is in the custom days array
      const todayDayOfWeek = today.getDay();
      if (!schedule.custom_days.includes(todayDayOfWeek)) {
        return false;
      }
      
      // For custom days, we need to check if this is a valid occurrence based on the start date
      // Calculate the first occurrence of each custom day after the start date
      const firstOccurrences = schedule.custom_days.map(day => {
        // Find the first occurrence of this day after the start date
        const firstDate = new Date(startDate);
        const daysToAdd = (day - firstDate.getDay() + 7) % 7;
        firstDate.setDate(firstDate.getDate() + daysToAdd);
        return firstDate;
      });
      
      // Sort the first occurrences by date
      firstOccurrences.sort((a, b) => a.getTime() - b.getTime());
      
      // If today is before the first occurrence of any custom day, return false
      if (today < firstOccurrences[0]) {
        return false;
      }
      
      // For each custom day, calculate all occurrences up to today
      // and check if today is one of them
      for (const day of schedule.custom_days) {
        // Find the first occurrence of this day after the start date
        const firstDate = new Date(startDate);
        const daysToAdd = (day - firstDate.getDay() + 7) % 7;
        firstDate.setDate(firstDate.getDate() + daysToAdd);
        
        // If today is the first occurrence, return true
        if (firstDate.getTime() === today.getTime()) {
          return true;
        }
        
        // If today is after the first occurrence, check if it's a multiple of 7 days from the first occurrence
        if (today > firstDate) {
          const daysSinceFirst = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceFirst % 7 === 0) {
            return true;
          }
        }
      }
      return false;
    }
    case 'interval': {
      if (!schedule.interval_days || schedule.interval_days <= 0) return false;
      
      // Calculate days since start
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if today falls on an interval
      return daysSinceStart % schedule.interval_days === 0;
    }
    default:
      return false;
  }
};

// Sort reptiles based on selected criteria
export const getSortedReptiles = (
  reptiles: (FeedingEventWithDetails | VirtualFeedingEvent)[], 
  sortBy: 'species' | 'name' | 'morph' | 'all'
) => {
  return [...reptiles].sort((a, b) => {
    // First sort by the stable key (reptile_id) to maintain consistent order
    const aId = 'virtual' in a ? a.reptile_id : a.id;
    const bId = 'virtual' in b ? b.reptile_id : b.id;
    const idCompare = aId.localeCompare(bId);

    // Then apply the user's selected sort criteria
    if (sortBy === 'name') {
      const nameCompare = (a.reptile_name || '').localeCompare(b.reptile_name || '');
      return nameCompare || idCompare;
    } else if (sortBy === 'species') {
      const speciesCompare = (a.species_name || '').localeCompare(b.species_name || '');
      return speciesCompare || idCompare;
    } else if (sortBy === 'morph') {
      const morphCompare = (a.morph_name || '').localeCompare(b.morph_name || '');
      return morphCompare || idCompare;
    } else {
      return idCompare;
    }
  });
};

// Load reptiles based on target
export const loadReptilesByTarget = async (
  target: FeedingTargetWithDetails,
  schedule: FeedingScheduleWithTargets
): Promise<Reptile[]> => {
  try {
    console.log("Loading reptiles for target:", target);
    
    // If target type is 'reptile', handle it directly
    if (target.target_type === 'reptile') {
      // For reptile targets, we need to fetch all reptile targets from the schedule
      const reptileTargets = schedule.targets.filter(t => t.target_type === 'reptile');
      console.log(`Found ${reptileTargets.length} reptile targets in schedule`);
      
      if (reptileTargets.length === 0) {
        console.log("No reptile targets found in schedule");
        return [];
      }
      
      try {
        // Fetch all reptiles in parallel
        const reptilePromises = reptileTargets.map(t => getReptileById(t.target_id));
        const reptiles = await Promise.all(reptilePromises);
        console.log(`Loaded ${reptiles.length} reptiles:`, reptiles);
        return reptiles;
      } catch (error) {
        console.error('Error fetching reptiles:', error);
        toast.error(`Failed to fetch reptiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
      }
    } else {
      // For location-based targets, use the API function
      console.log(`Fetching reptiles by ${target.target_type} with ID: ${target.target_id}`);
      try {
        const reptiles = await getReptilesByLocation(
          target.target_type as 'room' | 'rack' | 'level' | 'location', 
          target.target_id
        );
        console.log(`Found ${reptiles?.length || 0} reptiles for ${target.target_type}:`, reptiles);
        return reptiles || [];
      } catch (error) {
        console.error(`Error fetching reptiles by ${target.target_type}:`, error);
        toast.error(`Failed to fetch reptiles by ${target.target_type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
      }
    }
  } catch (error) {
    console.error('Error loading reptiles:', error);
    toast.error('Failed to load reptiles for target');
    return [];
  }
};

// Create a real event from a virtual event
export const createRealEventFromVirtual = async (
  virtualEvent: VirtualFeedingEvent, 
  scheduleId: string,
  queryClient: QueryClient,
  activeTargetId: string | null,
  fed: boolean = true, 
  notes: string = '',
  onEventsUpdated?: () => void
) => {
  try {
    // Optimistically update the UI before the API call
    // Remove the virtual event from the list
    queryClient.setQueryData(['virtual-feeding-events', scheduleId, activeTargetId], 
      (oldData: VirtualFeedingEvent[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(ve => 
          !(ve.reptile_id === virtualEvent.reptile_id && ve.scheduled_date === virtualEvent.scheduled_date)
        );
      }
    );
    
    // Create the new event
    const newEvent = await createFeedingEvent({
      schedule_id: scheduleId,
      reptile_id: virtualEvent.reptile_id,
      scheduled_date: virtualEvent.scheduled_date,
      fed,
      fed_at: fed ? new Date().toISOString() : null,
      notes: notes || null
    });
    
    toast.success("Feeding recorded");
    
    // Update the cache with the new event
    queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
      if (!oldData) return [newEvent];
      return [...oldData, newEvent];
    });
    
    // Only invalidate the feeding status query, not the events queries
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    
    if (onEventsUpdated) {
      onEventsUpdated();
    }

    return newEvent;
  } catch (error) {
    console.error('Error creating real event from virtual:', error);
    toast.error("Failed to record feeding");
    
    // Revert the optimistic update if the API call failed
    queryClient.invalidateQueries({ queryKey: ['virtual-feeding-events', scheduleId, activeTargetId] });
    throw error;
  }
};

// Save notes for an event
export const saveEventNotes = async (
  eventId: string,
  notes: string | null,
  scheduleId: string,
  events: FeedingEventWithDetails[],
  queryClient: QueryClient,
  onEventsUpdated?: () => void
) => {
  try {
    // Get the current event to preserve its fed status
    const currentEvent = events.find(e => e.id === eventId);
    if (!currentEvent) {
      throw new Error('Event not found');
    }
    
    // Optimistic update
    queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(event => 
        event.id === eventId 
          ? { ...event, notes: notes || null } 
          : event
      );
    });
    
    const updatedEvent = await updateFeedingEvent(eventId, {
      notes: notes || null,
      fed: currentEvent.fed // Preserve the current fed status
    });
    
    // Update the cache with the server response
    queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
      if (!oldData) return [updatedEvent];
      return oldData.map(event => event.id === eventId ? { ...event, ...updatedEvent } : event);
    });
    
    // Only invalidate the feeding status query
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    
    toast.success('Notes saved successfully');
    
    if (onEventsUpdated) {
      onEventsUpdated();
    }

    return updatedEvent;
  } catch (error) {
    console.error('Error saving notes:', error);
    toast.error('Failed to save notes');
    throw error;
  }
};
