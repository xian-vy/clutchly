import { DetailedReptile } from "@/app/api/reptiles/reptileDetails";
import { HealthLogEntry } from "@/lib/types/health";

// Extend HealthLogEntry with the joined fields from the query
export interface EnrichedHealthLogEntry extends HealthLogEntry {
  category?: { label: string };
  subcategory?: { label: string };
  type?: { label: string };
}

// Extend the DetailedReptile type to use our custom health log type
export interface ExtendedDetailedReptile extends Omit<DetailedReptile, 'health_logs'> {
  health_logs: EnrichedHealthLogEntry[];
}

export interface ReptileTabProps {
  reptileDetails: ExtendedDetailedReptile | null;
} 