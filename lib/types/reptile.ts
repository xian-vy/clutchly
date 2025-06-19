import * as z from 'zod'

export type Sex = 'male' | 'female' | 'unknown'
export type Status = 'active' | 'sold' | 'deceased'

export interface HetTrait {
  trait: string;
  percentage: number;
  source?: 'visual_parent' | 'genetic_test' | 'breeding_odds';
  verified?: boolean;
}

export interface Reptile {
  id: string
  created_at: string
  org_id: string
  name: string
  price : number | null,
  reptile_code: string | null
  species_id: string
  morph_id: string
  visual_traits: string[] | null
  het_traits: HetTrait[] | null
  sex: Sex
  weight: number;
  length: number;
  hatch_date: string | null
  acquisition_date: string
  status: Status
  notes: string | null
  last_modified: string
  parent_clutch_id?: string | null
  dam_id ?: string | null
  sire_id?: string | null
  generation?: number 
  breeding_line?: string          
  is_breeder?: boolean   
  retired_breeder?: boolean       
  project_ids?: string[]
  location_id?: string | null
  original_breeder : string | null //produced_by
}
export type ReptileWithMorpgAndSpecies = Reptile & {
  morph_name: string;
  species_name: string;
}
export type NewReptile = Omit<Reptile, 'id' | 'created_at' | 'org_id' | 'last_modified'>

//for breeding
export type ReptileGeneInfo = { name: string; morphName: string, hets : HetTrait[] | null, visuals : string[] | null,  reptile_code: string | null }



export const reptileFormSchema = z.object({
  name: z.string().nullable(),
  reptile_code: z.string().nullable(),
  species_id: z.string().min(1, 'Species is required'),
  morph_id: z.string().min(1, 'Morph is required'),
  sex: z.enum(['male', 'female', 'unknown'] as const),
  hatch_date: z.string().nullable(),
  acquisition_date: z.string().min(1, 'Acquisition date is required'),
  status: z.enum(['active', 'sold', 'deceased'] as const),
  notes: z.string().nullable(),
  dam_id: z.string().nullable(),
  sire_id: z.string().nullable(),
  weight: z.coerce.number().min(0, 'Weight must be a positive number'),
  length: z.coerce.number().min(0, 'Length must be a positive number'),
  visual_traits: z.array(z.string()).nullable(),
  het_traits: z.array(z.object({
    trait: z.string(),
    percentage: z.number().min(0).max(100),
    source: z.enum(['visual_parent', 'genetic_test', 'breeding_odds']).optional(),
    verified: z.boolean().optional()
  })).nullable(),
  location_id: z.string().nullable(),
  original_breeder : z.string().nullable(),
  price: z.coerce.number().min(0, 'Price must be a positive number').nullable(),
})
