import { Morph } from "@/lib/types/morph";
import { HetTrait,Reptile,Sex, Status } from "@/lib/types/reptile";
import { Species } from "@/lib/types/species";
import { createClient } from '@/lib/supabase/server'

export interface ReptileImportRow {
    name: string
    reptile_code?: string
    sex: Sex
    species: string
    morph?: string
    hatch_date?: string
    acquisition_date: string
    weight?: number
    length?: number
    visual_traits?: string | string[]
    het_traits?: string | string[]
    original_breeder?: string | null
    status?: Status
    breeding_line?: string
    lineage_path?: string
    generation?: number
    is_breeder?: boolean | string
    retired_breeder?: boolean | string
    notes?: string
    dam_name?: string
    sire_name?: string
    price?: number
  }
  
  // Generic object type to avoid 'any'
  export type GenericObject = Record<string, unknown>;
  
  // Response for the preview of imported data
  export interface ImportPreviewResponse {
    headers: string[]
    mappedHeaders: Record<string, string>
    rows: ReptileImportRow[]
    validRows: number[]
    invalidRows: Record<number, string>
    speciesCount: number
    morphCount: number
    totalRows: number
    parentRelationships: {
      validParents: Record<number, { dam?: string; sire?: string }>
      invalidParents: Record<number, { dam?: string; sire?: string; error: string }>
    }
  }
  
  // Response for the final import
  export interface ImportResponse {
    success: boolean
    reptiles: Reptile[]
    errors: string[]
    speciesAdded: Species[]
    morphsAdded: (Morph & { species: { name: string } })[] 
  }
// Helper to parse boolean from various formats
export function parseBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lowerValue = String(value).toLowerCase()
      return ['true', '1', 'yes'].includes(lowerValue)
    }
    return !!value
  }
  
  // Helper to parse het traits from string format like "66% het albino, 33% het stripe"
  export function parseHetTraits(hetString: string | string[] | undefined): HetTrait[] | null {
    if (!hetString) return null;
    
    const traits: HetTrait[] = [];
    
    // If already an array, process each item
    const hetItems = Array.isArray(hetString) ? hetString : hetString.split(',');
    
    for (const item of hetItems) {
      // Trim each item to remove whitespace
      const trimmedItem = item.trim();
      if (!trimmedItem) continue;
      
      // Parse percentage if it exists (e.g., "66% het albino")
      const percentMatch = trimmedItem.match(/(\d+)%\s*(?:het)?\s*(.*)/i);
      
      if (percentMatch) {
        const percentage = parseInt(percentMatch[1], 10);
        const trait = percentMatch[2].trim();
        
        if (trait && !isNaN(percentage)) {
          traits.push({
            trait,
            percentage,
            source: 'breeding_odds', // Assume breeding odds as default source
            verified: false // Default to unverified
          });
        }
      } else {
        // No percentage found, assume 100% (e.g., "het albino")
        const traitMatch = trimmedItem.match(/(?:het)?\s*(.*)/i);
        if (traitMatch) {
          const trait = traitMatch[1].trim();
          if (trait) {
            traits.push({
              trait,
              percentage: 100,
              source: 'breeding_odds',
              verified: false
            });
          }
        }
      }
    }
    
    return traits.length > 0 ? traits : null;
  }

  
export function validateReptileRow(row: GenericObject): { valid: boolean; error?: string } {
    // Required fields validation
    if (!row.name || String(row.name).trim() === '') {
      return { valid: false, error: 'Name is required' }
    }
  
    // Sex validation
    if (!row.sex || !['male', 'female', 'unknown'].includes(String(row.sex).toLowerCase())) {
      return { valid: false, error: 'Sex must be male, female, or unknown' }
    }
  
    // Species validation
    if (!row.species || String(row.species).trim() === '') {
      return { valid: false, error: 'Species is required' }
    }
  
    // Acquisition date validation
    if (!row.acquisition_date || isNaN(new Date(String(row.acquisition_date)).getTime())) {
      return { valid: false, error: 'Acquisition date is required and must be a valid date' }
    }
  
    // Status validation (if provided)
    if (row.status && !['active', 'sold', 'deceased'].includes(String(row.status).toLowerCase())) {
      return { valid: false, error: 'Status must be active, sold, or deceased' }
    }
  
    // Hatch date validation (if provided)
    if (row.hatch_date && isNaN(new Date(String(row.hatch_date)).getTime())) {
      return { valid: false, error: 'Hatch date must be a valid date' }
    }
  
    // Weight validation (if provided)
    if (row.weight && (isNaN(Number(row.weight)) || Number(row.weight) <= 0)) {
      return { valid: false, error: 'Weight must be a positive number' }
    }
  
    // Length validation (if provided)
    if (row.length && (isNaN(Number(row.length)) || Number(row.length) <= 0)) {
      return { valid: false, error: 'Length must be a positive number' }
    }
  
    // Generation validation (if provided)
    if (row.generation && (isNaN(Number(row.generation)) || Number(row.generation) < 0)) {
      return { valid: false, error: 'Generation must be a non-negative integer' }
    }

    // Price validation (if provided)
    if (row.price && (isNaN(Number(row.price)) || Number(row.price) < 0)) {
      return { valid: false, error: 'Price must be a non-negative number' }
    }
  
    // Boolean validations (if provided)
    const booleanFields = ['is_breeder', 'retired_breeder']
    for (const field of booleanFields) {
      if (row[field] !== undefined && row[field] !== null) {
        if (typeof row[field] === 'string') {
          const value = String(row[field]).toLowerCase()
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value)) {
            return { valid: false, error: `${field} must be a boolean value (true/false, 1/0, yes/no)` }
          }
        } else if (typeof row[field] !== 'boolean') {
          return { valid: false, error: `${field} must be a boolean value` }
        }
      }
    }
  
    return { valid: true }
  }

  export async function checkRateLimit(userId: string): Promise<boolean> {
    const supabase = await createClient()
    
    // Check how many imports user has done in the last hour
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    
    const { data: recentImports, error } = await supabase
      .from('import_logs')
      .select('count')
      .eq('org_id', userId)
      .gte('created_at', oneHourAgo.toISOString())
    
    if (error) {
      console.error('Error checking rate limit:', error)
      return false // Assume limit reached on error
    }
    
    // Count imports in the last hour
    const count = recentImports?.length || 0
    return count < 5 // Limit is 5 per hour
  }
  
  // Log an import
  export async function logImport(userId: string, fileName: string, rowCount: number): Promise<void> {
    const supabase = await createClient()
    
    await supabase
      .from('import_logs')
      .insert([{
        org_id: userId,
        file_name: fileName,
        row_count: rowCount
      }])
  } 