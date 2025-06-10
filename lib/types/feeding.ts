export type RecurrenceType = 'daily' | 'weekly' | 'interval';
export type TargetType = 'room' | 'rack' | 'level' | 'location' | 'reptile';

export interface FeedingSchedule {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  recurrence: RecurrenceType;
  interval_days: number | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedingTarget {
  id: string;
  schedule_id: string;
  target_type: TargetType;
  target_id: string;
}

export interface FeedingEvent {
  id: string;
  schedule_id: string;
  reptile_id: string;
  scheduled_date: string;
  fed: boolean;
  fed_at: string | null;
  feeder_size_id: string | null; 
  notes: string | null;
}

export type NewFeedingSchedule = Omit<FeedingSchedule, 'id' | 'created_at' | 'updated_at' | 'org_id'>;
export type NewFeedingTarget = Omit<FeedingTarget, 'id'>;
export type NewFeedingEvent = Omit<FeedingEvent, 'id'>;

export interface FeedingTargetWithDetails extends FeedingTarget {
  location_label?: string;
  room_name?: string;
  rack_name?: string;
  level_number?: string | number;
  reptile_name?: string;
}

export interface FeedingScheduleWithTargets extends FeedingSchedule {
  targets: FeedingTargetWithDetails[];
}

export interface FeedingEventWithDetails extends FeedingEvent {
  reptile_name: string;
  species_name: string;
  morph_name: string;
  reptile_code: string;
} 

// for reptile details
export interface FeedingEventsWithFeederDetails extends FeedingEvent {
  feeder_size_name?: string | null;
  feeder_type_name?: string | null;
}