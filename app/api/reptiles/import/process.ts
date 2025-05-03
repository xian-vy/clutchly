'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateGrowthEntryInput } from '@/lib/types/growth'
import { Morph, NewMorph } from '@/lib/types/morph'
import { HetTrait, NewReptile, Reptile, Sex, Status } from '@/lib/types/reptile'
import { NewSpecies, Species } from '@/lib/types/species'
import { generateReptileCode, getSpeciesCode } from '@/components/dashboard/reptiles/utils'

// Since we couldn't install xlsx and papaparse, we'll use a simpler approach
// Type for CSV/Excel row from import
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
}

// Generic object type to avoid 'any'
type GenericObject = Record<string, unknown>;

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

// Validate a single reptile row
function validateReptileRow(row: GenericObject): { valid: boolean; error?: string } {
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

// For simplicity, since we can't directly access xlsx and papaparse libraries
// we'll use a simplified approach that assumes the data is already parsed
export async function previewImportData(parsedData: GenericObject[]): Promise<ImportPreviewResponse> {
  const rows = parsedData

  if (rows.length === 0) {
    throw new Error('No data found in the imported file')
  }

  if (rows.length > 500) {
    throw new Error('File exceeds the maximum limit of 500 rows')
  }

  // Get original headers
  const headers = Object.keys(rows[0])

  // Map headers to our schema
  const defaultMappings: Record<string, string> = {
    name: 'name',
    reptile_code: 'reptile_code',
    'reptile code': 'reptile_code',
    sex: 'sex',
    species: 'species',
    morph: 'morph',
    'hatch date': 'hatch_date',
    hatch_date: 'hatch_date',
    'acquisition date': 'acquisition_date',
    acquisition_date: 'acquisition_date',
    weight: 'weight',
    length: 'length',
    'visual traits': 'visual_traits',
    visual_traits: 'visual_traits',
    'het traits': 'het_traits',
    'hets': 'het_traits',
    het_traits: 'het_traits',
    'produced by': 'original_breeder',
    produced_by: 'original_breeder',
    status: 'status',
    'breeding line': 'breeding_line',
    breeding_line: 'breeding_line',
    'lineage path': 'lineage_path',
    lineage_path: 'lineage_path',
    generation: 'generation',
    'is breeder': 'is_breeder',
    is_breeder: 'is_breeder',
    'retired breeder': 'retired_breeder',
    retired_breeder: 'retired_breeder',
    notes: 'notes',
    dam: 'dam_name',
    dam_name: 'dam_name',
    mother: 'dam_name',
    sire: 'sire_name',
    sire_name: 'sire_name',
    father: 'sire_name'
  }

  const mappedHeaders: Record<string, string> = {}
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase()
    mappedHeaders[header] = defaultMappings[lowerHeader] || ''
  })

  // Validate each row
  const validRows: number[] = []
  const invalidRows: Record<number, string> = {}
  const parentRelationships = {
    validParents: {} as Record<number, { dam?: string; sire?: string }>,
    invalidParents: {} as Record<number, { dam?: string; sire?: string; error: string }>
  }
  
  const normalizedRows = rows.map(row => {
    const normalizedRow: Record<string, unknown> = {}
    
    Object.entries(row).forEach(([key, value]) => {
      const mappedField = mappedHeaders[key]
      if (mappedField) {
        // Handle special field normalization
        if (typeof value === 'string') {
          normalizedRow[mappedField] = value.trim()
        } else {
          normalizedRow[mappedField] = value
        }
        
        // Handle boolean fields
        if (['is_breeder', 'retired_breeder'].includes(mappedField) && typeof value === 'string') {
          const lowerValue = String(value).toLowerCase()
          normalizedRow[mappedField] = ['true', '1', 'yes'].includes(lowerValue)
        }
        
        // Handle numeric fields
        if (['weight', 'length', 'generation'].includes(mappedField) && value !== null && value !== undefined) {
          normalizedRow[mappedField] = Number(value)
        }
        
        // Handle comma-separated string arrays
        if (['visual_traits', 'primary_genetics'].includes(mappedField) && typeof value === 'string') {
          normalizedRow[mappedField] = value.split(',').map(item => item.trim()).filter(Boolean)
        }
      }
    })
    
    return normalizedRow as unknown as ReptileImportRow
  })

  // Validate each row
  normalizedRows.forEach((row, index) => {
    const validation = validateReptileRow(row as unknown as GenericObject)
    if (validation.valid) {
      validRows.push(index)
    } else {
      invalidRows[index] = validation.error || 'Unknown error'
    }
    
    // Check for parent references
    if (row.dam_name || row.sire_name) {
      // Track parent references for later validation
      const parents: { dam?: string; sire?: string } = {}
      if (row.dam_name) parents.dam = row.dam_name
      if (row.sire_name) parents.sire = row.sire_name
      
      parentRelationships.validParents[index] = parents
    }
  })

  // Validate parent relationships
  // First, create a map of reptile names in the current import
  const nameMap = new Map<string, number>()
  normalizedRows.forEach((row, index) => {
    if (row.name) {
      nameMap.set(row.name.toString().toLowerCase(), index)
    }
  })
  
  // Check each parent reference
  Object.entries(parentRelationships.validParents).forEach(([rowIndexStr, parents]) => {
    const rowIndex = parseInt(rowIndexStr)
    //const currentRow = normalizedRows[rowIndex]
    
    // Check for dam reference
    if (parents.dam) {
      const damNameLower = parents.dam.toLowerCase()
      const damIndex = nameMap.get(damNameLower)
      
      // If dam is in the import but appears after current row
      if (damIndex !== undefined && damIndex > rowIndex) {
        // Move to invalid parents
        const error = `Dam '${parents.dam}' appears later in import (row ${damIndex + 1}). Please reorder rows.`
        parentRelationships.invalidParents[rowIndex] = {
          ...parents,
          error
        }
        delete parentRelationships.validParents[rowIndex]
        return
      }
      
      // Check if the referenced dam is the right sex
      if (damIndex !== undefined) {
        const damRow = normalizedRows[damIndex]
        if (damRow.sex && damRow.sex.toString().toLowerCase() !== 'female') {
          // Move to invalid parents
          const error = `Dam '${parents.dam}' is not female (sex: ${damRow.sex})`
          parentRelationships.invalidParents[rowIndex] = {
            ...parents,
            error
          }
          delete parentRelationships.validParents[rowIndex]
          return
        }
      }
    }
    
    // Check for sire reference
    if (parents.sire) {
      const sireNameLower = parents.sire.toLowerCase()
      const sireIndex = nameMap.get(sireNameLower)
      
      // If sire is in the import but appears after current row
      if (sireIndex !== undefined && sireIndex > rowIndex) {
        // Move to invalid parents
        const error = `Sire '${parents.sire}' appears later in import (row ${sireIndex + 1}). Please reorder rows.`
        parentRelationships.invalidParents[rowIndex] = {
          ...parents,
          error
        }
        delete parentRelationships.validParents[rowIndex]
        return
      }
      
      // Check if the referenced sire is the right sex
      if (sireIndex !== undefined) {
        const sireRow = normalizedRows[sireIndex]
        if (sireRow.sex && sireRow.sex.toString().toLowerCase() !== 'male') {
          // Move to invalid parents
          const error = `Sire '${parents.sire}' is not male (sex: ${sireRow.sex})`
          parentRelationships.invalidParents[rowIndex] = {
            ...parents,
            error
          }
          delete parentRelationships.validParents[rowIndex]
          return
        }
      }
    }
  })

  // Count unique species and morphs
  const uniqueSpecies = new Set<string>()
  const uniqueMorphs = new Set<string>()
  
  normalizedRows.forEach(row => {
    if (row.species) uniqueSpecies.add(String(row.species))
    if (row.morph) uniqueMorphs.add(String(row.morph))
  })

  return {
    headers,
    mappedHeaders,
    rows: normalizedRows,
    validRows,
    invalidRows,
    speciesCount: uniqueSpecies.size,
    morphCount: uniqueMorphs.size,
    totalRows: rows.length,
    parentRelationships
  }
}

// Helper to parse boolean from various formats
function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lowerValue = String(value).toLowerCase()
    return ['true', '1', 'yes'].includes(lowerValue)
  }
  return !!value
}

// Helper to parse het traits from string format like "66% het albino, 33% het stripe"
function parseHetTraits(hetString: string | string[] | undefined): HetTrait[] | null {
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

// Process the import after user confirmation
export async function processImport(
  rows: ReptileImportRow[],
  rowsToImport: number[]
): Promise<ImportResponse> {
  const supabase = await createClient()
  const currentUser = await supabase.auth.getUser()
  const userId = currentUser.data.user?.id
  
  if (!userId) {
    throw new Error('User authentication required')
  }
  
  const response: ImportResponse = {
    success: false,
    reptiles: [],
    errors: [],
    speciesAdded: [],
    morphsAdded: [] as (Morph & { species: { name: string } })[]
  }
  
  // Only import the selected rows
  const selectedRows = rowsToImport.map(index => rows[index])
  
  try {
    // Track species and morphs by name to avoid duplicates
    const speciesMap: Record<string, number> = {}
    // Change morphMap to use compound keys (species_id:morph_name)
    const morphMap: Record<string, number> = {}
    
    // Step 1: Fetch existing species and morphs
    const { data: existingSpecies } = await supabase
      .from('species')
      .select('id, name')
      .or(`user_id.eq.${userId},is_global.eq.true`)
    
    if (existingSpecies) {
      existingSpecies.forEach(species => {
        speciesMap[species.name.toLowerCase()] = species.id
      })
    }
    
    const { data: existingMorphs } = await supabase
      .from('morphs')
      .select('id, name, species_id')
      .or(`user_id.eq.${userId},is_global.eq.true`)
    
    if (existingMorphs) {
      existingMorphs.forEach(morph => {
        // Use compound key with species_id and morph name
        const compoundKey = `${morph.species_id}:${morph.name.toLowerCase()}`
        morphMap[compoundKey] = morph.id
      })
    }
    
    // Fetch existing reptiles for sequence number generation and parent lookup
    const { data: existingReptiles } = await supabase
      .from('reptiles')
      .select('*')
      .eq('user_id', userId)
    
    // Create a map of existing reptile names for parent lookup
    const existingReptileMap = new Map<string, string>()
    if (existingReptiles) {
      existingReptiles.forEach(reptile => {
        existingReptileMap.set(reptile.name.toLowerCase(), reptile.id)
      })
    }
    
    // Create a map to store imported reptile IDs by name
    const importedReptileMap = new Map<string, string>()
    
    // Steps 2 & 3: Process species and morphs that don't exist yet
    const newSpecies: NewSpecies[] = []
    for (const row of selectedRows) {
      if (!row.species) continue
      
      const speciesName = String(row.species).trim()
      const speciesKey = speciesName.toLowerCase()
      
      if (!speciesMap[speciesKey]) {
        // Add to list of new species to create
        newSpecies.push({
          name: speciesName,
          scientific_name: null,
          care_level: 'intermediate', // Default value
          is_global: false
        })
      }
    }
    
    // Insert new species
    if (newSpecies.length > 0) {
      const { data: createdSpecies, error: speciesError } = await supabase
        .from('species')
        .insert(newSpecies.map(species => ({ ...species, user_id: userId })))
        .select('id, name')
      
      if (speciesError) throw speciesError
      
      if (createdSpecies) {
        createdSpecies.forEach(species => {
          speciesMap[species.name.toLowerCase()] = species.id
          response.speciesAdded.push({
            user_id: userId,
            id : species.id,
            name: species.name,
            scientific_name: null,
            care_level : 'intermediate',
          })
        })
      }
    }
    
    // Step 4: Process morphs that don't exist yet
    for (const row of selectedRows) {
      if (!row.morph) continue
      
      const morphName = String(row.morph).trim()
      const speciesName = String(row.species).trim()
      const speciesKey = speciesName.toLowerCase()
      const speciesId = speciesMap[speciesKey]
      
      if (!speciesId) {
        response.errors.push(`Species not found for morph ${morphName}`)
        continue
      }
      
      // Create compound key with species_id and morph name
      const compoundKey = `${speciesId}:${morphName.toLowerCase()}`
      
      if (!morphMap[compoundKey]) {
        // Create new morph
        const newMorph: NewMorph = {
          name: morphName,
          description: null,
          species_id: speciesId,
          is_global: false
        }
        
        const { data: createdMorph, error: morphError } = await supabase
          .from('morphs')
          .insert([{ ...newMorph, user_id: userId }])
          .select('id, name')
          .single()
        
        if (morphError) throw morphError
        
        if (createdMorph) {
          morphMap[compoundKey] = createdMorph.id
          response.morphsAdded.push({
            user_id: userId,
            id: createdMorph.id,
            name: createdMorph.name,
            species_id: speciesId,
            description : "",
            species: {
              name: row.species
            }
          })
        }
      }
    }
    
    // Step 4: First pass - Create reptiles without setting parents
    for (const row of selectedRows) {
      try {
        const speciesId = speciesMap[String(row.species).toLowerCase()]
        if (!speciesId) {
          response.errors.push(`Species not found for reptile ${row.name}`)
          continue
        }
        
        // Check if reptile with same name already exists
        const { data: existingReptile } = await supabase
          .from('reptiles')
          .select('id')
          .eq('name', row.name)
          .eq('user_id', userId)
          .maybeSingle()
        
        if (existingReptile) {
          response.errors.push(`Reptile with name ${row.name} already exists, skipping`)
          continue
        }
        
        // Get morph name for reptile code generation
        let morphName = ""
        if (row.morph) {
          const speciesId = speciesMap[String(row.species).toLowerCase()]
          // Use compound key to look up the morph
          const compoundKey = `${speciesId}:${String(row.morph).toLowerCase()}`
          const morphId = morphMap[compoundKey]
          
          if (morphId) {
            const matchedMorph = existingMorphs?.find(m => m.id === morphId) || 
              response.morphsAdded.find(m => m.id === morphId)
            
            if (matchedMorph) {
              morphName = matchedMorph.name
            }
          }
        }
        
        // Generate reptile code if not provided
        let reptileCode = row.reptile_code || ""
        if (!reptileCode && morphName) {
          const speciesObj = existingSpecies?.find(s => s.id === speciesId) || 
            response.speciesAdded.find(s => s.id === speciesId)
            
          if (speciesObj) {
            const speciesCode = getSpeciesCode(speciesObj.name)
            
            // Include newly created reptiles in this import to avoid duplicate sequence numbers
            const allReptiles = [
              ...(existingReptiles || []), 
              ...response.reptiles
            ]
            
            reptileCode = generateReptileCode(
              allReptiles as Reptile[],
              speciesCode,
              morphName,
              row.hatch_date || null,
              row.sex
            )
          }
        }
        
        // Prepare reptile data
        const newReptile: NewReptile = {
          name: row.name,
          reptile_code: reptileCode || null,
          sex: (String(row.sex).toLowerCase() as Sex),
          species_id: speciesId.toString(),
          morph_id: row.morph ? (() => {
            const speciesId = speciesMap[String(row.species).toLowerCase()]
            const compoundKey = `${speciesId}:${String(row.morph).toLowerCase()}`
            return morphMap[compoundKey]?.toString() || ""
          })() : "",
          visual_traits: Array.isArray(row.visual_traits) ? row.visual_traits : 
                       (typeof row.visual_traits === 'string' ? row.visual_traits.split(',').map(t => t.trim()) : null),
          het_traits: parseHetTraits(row.het_traits),
          weight: row.weight ? Number(row.weight) : 0,
          length: row.length ? Number(row.length) : 0,
          hatch_date: row.hatch_date || null,
          acquisition_date: row.acquisition_date,
          status: (row.status?.toLowerCase() as Status) || 'active',
          notes: row.notes || null,
          is_breeder: typeof row.is_breeder !== 'undefined' ? parseBoolean(row.is_breeder) : false,
          retired_breeder: typeof row.retired_breeder !== 'undefined' ? parseBoolean(row.retired_breeder) : false,
          breeding_line: row.breeding_line || undefined,
          generation: typeof row.generation !== 'undefined' ? Number(row.generation) : undefined,
          original_breeder: row.original_breeder || '',
          location_id: null, // Not supported in import
          parent_clutch_id: null, // Not supported in import
          dam_id: null, // Not supported in import
          sire_id: null, // Not supported in import
          project_ids: undefined, // Not supported in import
        }
        
        // Insert reptile
        const { data: createdReptile, error: reptileError } = await supabase
          .from('reptiles')
          .insert([{ ...newReptile, user_id: userId }])
          .select('*')
          .single()
        
        if (reptileError) throw reptileError
        
        if (createdReptile) {
          response.reptiles.push(createdReptile)
          // Store the created reptile ID for parent linking
          importedReptileMap.set(createdReptile.name.toLowerCase(), createdReptile.id)
          
          // Only create growth entry if weight or length is provided
          if (row.weight || row.length) {
            const growthEntry: CreateGrowthEntryInput = {
              reptile_id: createdReptile.id,
              user_id: userId,
              date: row.hatch_date || row.acquisition_date,
              weight: row.weight || 0,
              length: row.length || 0,
              notes: "Imported with reptile record.",
              attachments: [],
            }
            
            const { error: growthError } = await supabase
              .from('growth_entries')
              .insert([growthEntry])
            
            if (growthError) throw growthError
          }
        }
      } catch (error) {
        console.error('Error processing row:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        response.errors.push(`Error processing ${row.name}: ${errorMessage}`)
      }
    }
    
    // Step 5: Second pass - Update reptiles with parent references
    for (const row of selectedRows) {
      if (!row.dam_name && !row.sire_name) continue
      
      try {
        // Look up the reptile we just created
        const reptileName = row.name.toLowerCase()
        const reptileId = importedReptileMap.get(reptileName)
        
        if (!reptileId) {
          response.errors.push(`Could not find reptile ID for ${row.name} to set parents`)
          continue
        }
        
        let damId: string | null = null
        let sireId: string | null = null
        
        // Look up dam
        if (row.dam_name) {
          const damName = row.dam_name.toLowerCase()
          // Check imported reptiles first, then existing reptiles
          damId = importedReptileMap.get(damName) || existingReptileMap.get(damName) || null
          
          if (!damId) {
            response.errors.push(`Could not find dam "${row.dam_name}" for reptile ${row.name}`)
          }
        }
        
        // Look up sire
        if (row.sire_name) {
          const sireName = row.sire_name.toLowerCase()
          // Check imported reptiles first, then existing reptiles
          sireId = importedReptileMap.get(sireName) || existingReptileMap.get(sireName) || null
          
          if (!sireId) {
            response.errors.push(`Could not find sire "${row.sire_name}" for reptile ${row.name}`)
          }
        }
        
        // Only update if we found at least one parent
        if (damId || sireId) {
          const updateData: { dam_id?: string; sire_id?: string } = {}
          if (damId) updateData.dam_id = damId
          if (sireId) updateData.sire_id = sireId
          
          const { error: updateError } = await supabase
            .from('reptiles')
            .update(updateData)
            .eq('id', reptileId)
          
          if (updateError) {
            throw updateError
          }
          
          // Update the reptile in our response array
          const reptileIndex = response.reptiles.findIndex(r => r.id === reptileId)
          if (reptileIndex !== -1) {
            response.reptiles[reptileIndex] = {
              ...response.reptiles[reptileIndex],
              ...updateData
            }
          }
        }
      } catch (error) {
        console.error('Error updating parent references:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        response.errors.push(`Error setting parents for ${row.name}: ${errorMessage}`)
      }
    }
    
    response.success = true
    return response
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Import failed: ${errorMessage}`)
  }
}

// Check upload rate limit for a user
export async function checkRateLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Check how many imports user has done in the last hour
  const oneHourAgo = new Date()
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)
  
  const { data: recentImports, error } = await supabase
    .from('import_logs')
    .select('count')
    .eq('user_id', userId)
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
      user_id: userId,
      file_name: fileName,
      row_count: rowCount
    }])
} 