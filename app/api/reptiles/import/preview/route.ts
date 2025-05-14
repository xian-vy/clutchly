'use server'
import { checkRateLimit, GenericObject, ImportPreviewResponse,  ReptileImportRow, validateReptileRow } from '@/app/api/reptiles/import/utils'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import * as XLSX from 'xlsx-js-style'


// Handle file upload for preview
export async function POST(request: NextRequest) {
  try {
    // Get current user ID
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check rate limit
    const withinRateLimit = await checkRateLimit(user.id)
    if (!withinRateLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Check file size
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File exceeds maximum size of 2MB' },
        { status: 400 }
      )
    }
    
    // Read and parse file based on type
    let parsedData: Record<string, ReptileImportRow>[] = []
    if (file.type === 'text/csv') {
      const text = await file.text()
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      })
      // Make sure parsed data is properly formatted
      parsedData = (result.data as Record<string, ReptileImportRow>[]).map(item => {
        if (typeof item === 'object' && item !== null) {
          return Object.fromEntries(
            Object.entries(item).map(([key, value]) => [
              String(key), 
              value
            ])
          );
        }
        return {} as Record<string, ReptileImportRow>;
      });
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const rawData = XLSX.utils.sheet_to_json(worksheet)
      parsedData = rawData as Record<string, ReptileImportRow>[];
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload CSV or Excel file.' },
        { status: 400 }
      )
    }
    
    // Get import preview
    const previewResult : ImportPreviewResponse = await previewImportData(parsedData)
    
    return NextResponse.json(previewResult)
    
  } catch (error) {
    console.error('Import preview error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    )
  }
}

 async function previewImportData(parsedData: GenericObject[]): Promise<ImportPreviewResponse> {
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

