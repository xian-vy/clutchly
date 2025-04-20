import { NextRequest, NextResponse } from 'next/server'
import { previewImportData, processImport, checkRateLimit, logImport } from '@/app/api/reptiles/import/process'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx-js-style'
import Papa from 'papaparse'

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
    let parsedData: Record<string, any>[] = []
    if (file.type === 'text/csv') {
      const text = await file.text()
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      })
      // Make sure parsed data is properly formatted as Record<string, any>[] 
      parsedData = (result.data as any[]).map(item => {
        // Ensure each row is a proper object with string keys
        if (typeof item === 'object' && item !== null) {
          return Object.fromEntries(
            Object.entries(item).map(([key, value]) => [
              String(key), 
              value
            ])
          );
        }
        return {} as Record<string, any>;
      });
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      // Convert Excel data and ensure it's the right format
      const rawData = XLSX.utils.sheet_to_json(worksheet)
      parsedData = (rawData as any[]).map(row => ({ ...row }));
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload CSV or Excel file.' },
        { status: 400 }
      )
    }
    
    // Get import preview
    const previewResult = await previewImportData(parsedData, file.type)
    
    return NextResponse.json(previewResult)
    
  } catch (error: any) {
    console.error('Import preview error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    )
  }
}

// Handle import process
export async function PUT(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json()
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
      await logImport(user.id, fileName || 'reptile-import.csv', selectedRows.length)
    }
    
    return NextResponse.json(importResult)
    
  } catch (error: any) {
    console.error('Import processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process import' },
      { status: 500 }
    )
  }
} 