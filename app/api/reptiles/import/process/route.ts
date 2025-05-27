'use server'
import { NextRequest, NextResponse } from 'next/server'
import { logImport, ReptileImportRow,ImportResponse, parseBoolean, parseHetTraits, } from "../utils"
import { createClient } from '@/lib/supabase/server'
import { Morph, NewMorph } from "@/lib/types/morph"
import { NewSpecies } from "@/lib/types/species"
import { generateReptileCode, getSpeciesCode } from "@/components/dashboard/reptiles/utils"
import { NewReptile, Reptile, Sex, Status } from "@/lib/types/reptile"
import { CreateGrowthEntryInput } from "@/lib/types/growth"
import { getUserAndOrganizationInfo } from '@/app/api/utils_server'


interface ImportRequestBody {
  rows: ReptileImportRow[]
  selectedRows: number[]
  fileName: string
}
// Handle import process
export async function PUT(request: NextRequest) {
  try {
    const { organization } = await getUserAndOrganizationInfo()
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json() as ImportRequestBody
    const { rows, selectedRows, fileName } = body
    
    if (!rows || !selectedRows || !Array.isArray(selectedRows)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    
    // Process the import
    const importResult = await processImport(rows, selectedRows)
    
    // Log the import if successful
    if (importResult.success) {
      await logImport(organization.id, fileName || 'reptile-import.csv', selectedRows.length)
    }
    
    return NextResponse.json(importResult)
    
  } catch (error) {
    console.error('Import processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process import' },
      { status: 500 }
    )
  }
}
async function processImport(
  rows: ReptileImportRow[],
  rowsToImport: number[]
): Promise<ImportResponse> {
  const supabase = await createClient()
  const { organization } = await getUserAndOrganizationInfo()

  if (!organization) {
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
    const morphMap: Record<string, number> = {}
    
    // Step 1: Fetch existing species, morphs, and reptiles in parallel
    const [existingSpeciesResult, existingMorphsResult, existingReptilesResult] = await Promise.all([
      supabase
        .from('species')
        .select('id, name')
        .or(`org_id.eq.${organization.id},is_global.eq.true`),
      supabase
        .from('morphs')
        .select('id, name, species_id')
        .or(`org_id.eq.${organization.id},is_global.eq.true`),
      supabase
        .from('reptiles')
        .select('*')
        .eq('org_id', organization.id)
    ])
    
    const existingSpecies = existingSpeciesResult.data
    const existingMorphs = existingMorphsResult.data
    const existingReptiles = existingReptilesResult.data
    
    if (existingSpecies) {
      existingSpecies.forEach(species => {
        speciesMap[species.name.toLowerCase()] = species.id
      })
    }
    
    if (existingMorphs) {
      existingMorphs.forEach(morph => {
        const compoundKey = `${morph.species_id}:${morph.name.toLowerCase()}`
        morphMap[compoundKey] = morph.id
      })
    }
    
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
    // Keep these sequential due to dependencies
    const newSpecies: NewSpecies[] = []
    for (const row of selectedRows) {
      if (!row.species) continue
      
      const speciesName = String(row.species).trim()
      const speciesKey = speciesName.toLowerCase()
      
      if (!speciesMap[speciesKey]) {
        newSpecies.push({
          name: speciesName,
          scientific_name: null,
          care_level: 'intermediate',
          is_global: false
        })
      }
    }
    
    // Insert new species
    if (newSpecies.length > 0) {
      const { data: createdSpecies, error: speciesError } = await supabase
        .from('species')
        .insert(newSpecies.map(species => ({ ...species, org_id: organization.id })))
        .select('id, name')
      
      if (speciesError) throw speciesError
      
      if (createdSpecies) {
        createdSpecies.forEach(species => {
          speciesMap[species.name.toLowerCase()] = species.id
          response.speciesAdded.push({
            org_id: organization.id,
            id: species.id,
            name: species.name,
            scientific_name: null,
            care_level: 'intermediate',
          })
        })
      }
    }
    
    // Process morphs that don't exist yet
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
      
      const compoundKey = `${speciesId}:${morphName.toLowerCase()}`
      
      if (!morphMap[compoundKey]) {
        const newMorph: NewMorph = {
          name: morphName,
          description: null,
          species_id: speciesId,
          is_global: false
        }
        
        const { data: createdMorph, error: morphError } = await supabase
          .from('morphs')
          .insert([{ ...newMorph, org_id: organization.id }])
          .select('id, name')
          .single()
        
        if (morphError) throw morphError
        
        if (createdMorph) {
          morphMap[compoundKey] = createdMorph.id
          response.morphsAdded.push({
            org_id: organization.id,
            id: createdMorph.id,
            name: createdMorph.name,
            species_id: speciesId,
            description: "",
            species: {
              name: row.species
            }
          })
        }
      }
    }
    
    // Step 4: Create reptiles in parallel
    const reptilePromises = selectedRows.map(async (row) => {
      try {
        const speciesId = speciesMap[String(row.species).toLowerCase()]
        if (!speciesId) {
          response.errors.push(`Species not found for reptile ${row.name}`)
          return null
        }
        
        // Check if reptile with same name already exists
        const { data: existingReptile } = await supabase
          .from('reptiles')
          .select('id')
          .eq('name', row.name)
          .eq('org_id', organization.id)
          .maybeSingle()
        
        if (existingReptile) {
          response.errors.push(`Reptile with name ${row.name} already exists, skipping`)
          return null
        }
        
        // Get morph name for reptile code generation
        let morphName = ""
        if (row.morph) {
          const speciesId = speciesMap[String(row.species).toLowerCase()]
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
          location_id: null,
          parent_clutch_id: null,
          dam_id: null,
          sire_id: null,
          project_ids: undefined,
          price: row.price || null,
        }
        
        const { data: createdReptile, error: reptileError } = await supabase
          .from('reptiles')
          .insert([{ ...newReptile, org_id: organization.id }])
          .select('*')
          .single()
        
        if (reptileError) throw reptileError
        
        if (createdReptile) {
          importedReptileMap.set(createdReptile.name.toLowerCase(), createdReptile.id)
          
          // Create growth entry if needed
          if (row.weight || row.length) {
            const growthEntry: CreateGrowthEntryInput = {
              reptile_id: createdReptile.id,
              org_id: organization.id,
              date: row.hatch_date || row.acquisition_date,
              weight: row.weight || 0,
              length: row.length || 0,
              notes: "Imported with reptile record.",
              attachments: [],
            }
            
            await supabase
              .from('growth_entries')
              .insert([growthEntry])
          }
          
          return createdReptile
        }
        return null
      } catch (error) {
        console.error('Error processing row:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        response.errors.push(`Error processing ${row.name}: ${errorMessage}`)
        return null
      }
    })
    
    const createdReptiles = (await Promise.all(reptilePromises)).filter((r): r is Reptile => r !== null)
    response.reptiles.push(...createdReptiles)
    
    // Step 5: Update parent references in parallel
    const parentUpdatePromises = selectedRows
      .filter(row => row.dam_name || row.sire_name)
      .map(async (row) => {
        try {
          const reptileName = row.name.toLowerCase()
          const reptileId = importedReptileMap.get(reptileName)
          
          if (!reptileId) {
            response.errors.push(`Could not find reptile ID for ${row.name} to set parents`)
            return
          }
          
          let damId: string | null = null
          let sireId: string | null = null
          
          if (row.dam_name) {
            const damName = row.dam_name.toLowerCase()
            damId = importedReptileMap.get(damName) || existingReptileMap.get(damName) || null
            
            if (!damId) {
              response.errors.push(`Could not find dam "${row.dam_name}" for reptile ${row.name}`)
            }
          }
          
          if (row.sire_name) {
            const sireName = row.sire_name.toLowerCase()
            sireId = importedReptileMap.get(sireName) || existingReptileMap.get(sireName) || null
            
            if (!sireId) {
              response.errors.push(`Could not find sire "${row.sire_name}" for reptile ${row.name}`)
            }
          }
          
          if (damId || sireId) {
            const updateData: { dam_id?: string; sire_id?: string } = {}
            if (damId) updateData.dam_id = damId
            if (sireId) updateData.sire_id = sireId
            
            await supabase
              .from('reptiles')
              .update(updateData)
              .eq('id', reptileId)
            
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
      })
    
    await Promise.all(parentUpdatePromises)
    
    response.success = true
    return response
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Import failed: ${errorMessage}`)
  }
}