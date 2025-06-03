import { FeedingEventWithDetails, FeedingScheduleWithTargets, FeedingTargetWithDetails } from '@/lib/types/feeding';
import { Reptile } from '@/lib/types/reptile';
import { toast } from 'sonner';
import {  updateFeedingEvent } from '@/app/api/feeding/events';
import { getReptileById } from '@/app/api/reptiles/reptiles';
import { getReptilesByLocation } from '@/app/api/reptiles/byLocation';
import { QueryClient } from '@tanstack/react-query';
import { ScheduleStatus } from './FeedingEvents';

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

    case 'interval': {
      if (!schedule.interval_days || schedule.interval_days <= 0) return false;
      
      // Calculate days since start date
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If today is before start date, return false
      if (daysSinceStart < 0) return false;
      
      // Check if today falls on an interval day (divisible by interval_days)
      return daysSinceStart % schedule.interval_days === 0;
    }
    default:
      return false;
  }
};

// Sort reptiles based on the selected sort option
export const getSortedReptiles = (
  events: FeedingEventWithDetails[],
  sortBy: 'species' | 'name' | 'morph' | 'all'
): FeedingEventWithDetails[] => {
  if (sortBy === 'all' || !events || events.length === 0) {
    return events;
  }

  return [...events].sort((a, b) => {
    if (sortBy === 'name') {
      return a.reptile_name.localeCompare(b.reptile_name);
    } else if (sortBy === 'species') {
      return a.species_name.localeCompare(b.species_name);
    } else if (sortBy === 'morph') {
      return a.morph_name.localeCompare(b.morph_name);
    }
    return 0;
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

// Save notes for an event
export const saveEventNotes = async (
  eventId: string,
  notes: string | null,
  feederSizeId: string | null = null,
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
          ? { ...event, notes: notes || null, feeder_size_id: feederSizeId || null  } 
          : event
      );
    });
    
    const updatedEvent = await updateFeedingEvent(eventId, {
      notes: notes || null,
      fed: currentEvent.fed,
      feeder_size_id: feederSizeId || null
    });
    
    // Update the cache with the server response
    queryClient.setQueryData(['feeding-events', scheduleId], (oldData: FeedingEventWithDetails[] | undefined) => {
      if (!oldData) return [updatedEvent];
      return oldData.map(event => event.id === eventId ? { ...event, ...updatedEvent } : event);
    });
    
    // Only invalidate the feeding status query
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    queryClient.invalidateQueries({ queryKey: ['feeding-events-logs'] });

    toast.success('Details saved successfully');
    
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

// Update a feeding event with cache management
export const updateFeedingEventWithCache = async (
  eventId: string,
  fed: boolean,
  notes: string | null,
  feederSizeId: string | null,
  scheduleId: string,
  queryClient: QueryClient,
  onEventsUpdated?: () => void
) => {
  try {
    const currentEvents = queryClient.getQueryData<FeedingEventWithDetails[]>(['feeding-events', scheduleId]) || [];
    const eventToUpdate = currentEvents.find(e => e.id === eventId);
    
    if (eventToUpdate) {
      // Optimistically update events cache
      queryClient.setQueryData(['feeding-events', scheduleId], 
        currentEvents.map(event => 
          event.id === eventId 
            ? { ...event, fed, fed_at: fed ? new Date().toISOString() : null, notes: notes || null, feeder_size_id: feederSizeId || null } 
            : event
        )
      );
      
      // Optimistically update feeding status cache
      queryClient.setQueryData(['feeding-status'], (oldData: Record<string, ScheduleStatus> | undefined) => {
        if (!oldData || !oldData[scheduleId]) return oldData;
        const statusChange = eventToUpdate.fed !== fed ? 1 : 0;
        return {
          ...oldData,
          [scheduleId]: {
            ...oldData[scheduleId],
            completedEvents: oldData[scheduleId].completedEvents + (fed ? statusChange : -statusChange),
            percentage: Math.round(((oldData[scheduleId].completedEvents + (fed ? statusChange : -statusChange)) / oldData[scheduleId].totalEvents) * 100)
          }
        };
      });
    }
    
    // Make the API call
    const updatedEvent = await updateFeedingEvent(eventId, {
      fed,
      fed_at: fed ? new Date().toISOString() : null,
      notes: notes || null,
      feeder_size_id: feederSizeId || null
    });

    // Update cache with server response
    queryClient.setQueryData(['feeding-events', scheduleId], 
      currentEvents.map(event => 
        event.id === eventId ? { ...event, ...updatedEvent } : event
      )
    );

    queryClient.invalidateQueries({ queryKey: ['feeding-events-logs'] });

    if (onEventsUpdated) {
      onEventsUpdated();
    }

    return updatedEvent;
  } catch (error) {
    console.error('Error updating feeding event:', error);
    toast.error('Failed to update feeding status');
    
    // Revert both caches on error
    queryClient.invalidateQueries({ queryKey: ['feeding-events', scheduleId] });
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    throw error;
  }
};

// Save multiple feeding events at once (replaces the Feed All functionality)
export const saveMultipleEvents = async (
  events: { id: string, notes: string | null, feeder_size_id: string | null, fed: boolean }[],
  fed: boolean,
  scheduleId: string,
  queryClient: QueryClient,
  onEventsUpdated?: () => void
) => {
  try {
    // Get current events from cache
    const currentEvents = queryClient.getQueryData<FeedingEventWithDetails[]>(['feeding-events', scheduleId]) || [];
    
    // Optimistically update events cache
    const updatedEvents = currentEvents.map(event => {
      const update = events.find(e => e.id === event.id);
      if (update) {
        return {
          ...event,
          fed: update.fed,
          fed_at: update.fed ? new Date().toISOString() : null,
          notes: update.notes,
          feeder_size_id: update.feeder_size_id
        };
      }
      return event;
    });
    
    queryClient.setQueryData(['feeding-events', scheduleId], updatedEvents);
    
    // Optimistically update feeding status cache
    queryClient.setQueryData(['feeding-status'], (oldData: Record<string, ScheduleStatus> | undefined) => {
      if (!oldData || !oldData[scheduleId]) return oldData;
      
      const status = oldData[scheduleId];
      const completedEvents = updatedEvents.filter(e => e.fed).length;
      
      return {
        ...oldData,
        [scheduleId]: {
          ...status,
          completedEvents,
          isCompleted: completedEvents === status.totalEvents,
          percentage: Math.round((completedEvents / status.totalEvents) * 100)
        }
      };
    });

    // Make API calls in parallel
    const promises = events.map(event => 
      updateFeedingEvent(event.id, {
        fed: event.fed,
        fed_at: event.fed ? new Date().toISOString() : null,
        notes: event.notes,
        feeder_size_id: event.feeder_size_id
      })
    );
    
    await Promise.all(promises);

    if (onEventsUpdated) {
      onEventsUpdated();
    }
  } catch (error) {
    console.error('Error updating multiple feeding events:', error);
    toast.error('Failed to update feeding status');
    
    // Revert caches on error
    queryClient.invalidateQueries({ queryKey: ['feeding-events', scheduleId] });
    queryClient.invalidateQueries({ queryKey: ['feeding-status'] });
    throw error;
  }
};

export const getScheduleStats = async (schedule: FeedingScheduleWithTargets) => {
  // Count location-related targets (location, room, rack, level)
  const locationRelatedTargets = schedule.targets.filter(
    (target) => ['location', 'room', 'rack', 'level'].includes(target.target_type)
  );
  
  // Count direct reptile targets
  const reptileTargets = schedule.targets.filter(
    (target) => target.target_type === 'reptile'
  );
  
  let estimatedReptileCount = reptileTargets.length;
  
  // Get actual reptile counts from location-related targets
  try {
    const reptileCounts = await Promise.all(
      locationRelatedTargets.map(async (target) => {
        const reptiles = await getReptilesByLocation(
          target.target_type as 'room' | 'rack' | 'level' | 'location',
          target.target_id
        );
        return reptiles.length;
      })
    );
    
    estimatedReptileCount += reptileCounts.reduce((sum, count) => sum + count, 0);
  } catch (error) {
    console.error('Error counting reptiles:', error);
    // Fallback to simple estimation if query fails
    estimatedReptileCount += locationRelatedTargets.length;
  }
  
  // Calculate next feeding date
  const nextFeedingDate = getNextFeedingDay(schedule);
  
  return {
    locationCount: locationRelatedTargets.length,
    reptileCount: estimatedReptileCount,
    nextFeedingDate
  };
};

// FIXED: Proper next feeding day calculation that handles all scenarios correctly
const getNextFeedingDay = (schedule: FeedingScheduleWithTargets): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(schedule.start_date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = schedule.end_date ? new Date(schedule.end_date) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);
  
  switch (schedule.recurrence) {
    case 'daily': {
      // For daily schedules, next feeding is always tomorrow (or today if we haven't started yet)
      if (today < startDate) {
        return startDate;
      }
      
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Check if next date exceeds end date
      if (endDate && nextDate > endDate) {
        return endDate; // Return end date if we've reached the end
      }
      
      return nextDate;
    }

    case 'weekly': {
      const startDayOfWeek = startDate.getDay();
      const todayDayOfWeek = today.getDay();
      
      // If we haven't reached the start date yet
      if (today < startDate) {
        return startDate;
      }
      
      // Calculate next occurrence of the start day of week
      let daysToAdd = (startDayOfWeek - todayDayOfWeek + 7) % 7;
      
      // If today is the feeding day, next feeding is next week
      if (daysToAdd === 0) {
        daysToAdd = 7;
      }
      
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      
      // Check if next date exceeds end date
      if (endDate && nextDate > endDate) {
        return endDate;
      }
      
      return nextDate;
    }

    case 'interval': {
      if (!schedule.interval_days || schedule.interval_days <= 0) {
        return today;
      }
      
      // If we haven't reached the start date yet
      if (today < startDate) {
        return startDate;
      }
      
      // Calculate days since start
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate days until next feeding
      const daysUntilNext = schedule.interval_days - (daysSinceStart % schedule.interval_days);
      
      // If daysUntilNext is 0, it means today is a feeding day, so next feeding is after interval_days
      const actualDaysUntilNext = daysUntilNext === 0 ? schedule.interval_days : daysUntilNext;
      
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + actualDaysUntilNext);
      
      // Check if next date exceeds end date
      if (endDate && nextDate > endDate) {
        return endDate;
      }
      
      return nextDate;
    }

    default:
      return today;
  }
};

// NEW: Helper function to check if today is a scheduled feeding day
export const isTodayScheduledFeedingDay = (schedule: FeedingScheduleWithTargets): boolean => {
  return shouldHaveFeedingToday(schedule);
};