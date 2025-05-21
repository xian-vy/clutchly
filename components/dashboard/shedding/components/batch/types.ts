import { z } from 'zod'
import { Reptile } from '@/lib/types/reptile'

export interface ReptileWithLocation extends Reptile {
  location?: {
    id: string;
    label: string;
    rack: {
      id: string;
      name: string;
      room: {
        id: string;
        name: string;
      };
    };
  } | null;
  last_shed_date?: string | null;
  is_shedding?: boolean;
}

export interface FilterState {
  room: string;
  rack: string;
  ageGroup: string;
}

export const formSchema = z.object({
  reptile_ids: z.array(z.string()).min(1, 'Please select at least one reptile'),
  shed_date: z.string().min(1, 'Please select a date'),
  completeness: z.enum(['full', 'partial', 'retained', 'unknown'], {
    required_error: 'Please select completeness',
  }),
  notes: z.string().optional(),
  photo_url: z.string().optional(),
})

export type FormData = z.infer<typeof formSchema> 