'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { ImportPreviewResponse, ImportResponse } from '@/app/api/reptiles/import'
import { CheckCircle, AlertCircle, FileSpreadsheet, Upload, Info, Download } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ImportReptileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

enum ImportStep {
  SELECT_FILE = 0,
  PREVIEW = 1,
  IMPORTING = 2,
  COMPLETE = 3,
}

export function ImportReptileDialog({ open, onOpenChange, onImportComplete }: ImportReptileDialogProps) {
  const [step, setStep] = useState<ImportStep>(ImportStep.SELECT_FILE)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [importResult, setImportResult] = useState<ImportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Don't reset if we're in the importing step
      if (step !== ImportStep.IMPORTING) {
        setStep(ImportStep.SELECT_FILE)
        setFile(null)
        setPreviewData(null)
        setSelectedRows([])
        setImportResult(null)
        setError(null)
        setIsLoading(false)
      } else {
        // If importing, prevent dialog from closing
        onOpenChange(true)
        toast.info("Please wait for the import to complete before closing")
        return
      }
    }
    onOpenChange(open)
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      validateAndSetFile(selectedFile)
    }
  }

  // Validate file size and type
  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    
    // Check file type
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a CSV or Excel file.')
      toast.error('Invalid file type. Please upload a CSV or Excel file.')
      return
    }
    
    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 2MB limit.')
      toast.error('File size exceeds the 2MB limit.')
      return
    }
    
    setFile(selectedFile)
  }

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  // Trigger file input click
  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Preview the imported data
  const handlePreview = async () => {
    if (!file) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      
      toast.loading('Processing file preview...')
      
      // Send to API for preview
      const response = await fetch('/api/reptiles/import', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview file')
      }
      
      const data = await response.json() as ImportPreviewResponse
      setPreviewData(data)
      
      // Auto-select valid rows
      setSelectedRows(data.validRows)
      
      // Move to preview step
      setStep(ImportStep.PREVIEW)
      toast.dismiss()
      toast.success(`Found ${data.validRows.length} valid entries out of ${data.totalRows} total`)
    } catch (err: any) {
      console.error('Preview error:', err)
      setError(err.message || 'Failed to preview file')
      toast.dismiss()
      toast.error(err.message || 'Failed to preview file')
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle row selection
  const toggleRowSelection = (rowIndex: number) => {
    setSelectedRows(prev => {
      if (prev.includes(rowIndex)) {
        return prev.filter(idx => idx !== rowIndex)
      } else {
        return [...prev, rowIndex]
      }
    })
  }

  // Select all valid rows
  const selectAllValidRows = () => {
    if (!previewData) return
    setSelectedRows([...previewData.validRows])
    toast.success(`Selected all ${previewData.validRows.length} valid rows`)
  }

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedRows([])
    toast.info('All selections cleared')
  }

  // Process the import
  const handleImport = async () => {
    if (!previewData || selectedRows.length === 0 || !file) return
    
    setIsLoading(true)
    setError(null)
    setStep(ImportStep.IMPORTING)
    
    const importToastId = toast.loading(`Importing ${selectedRows.length} reptiles...`)
    
    try {
      // Send to API for processing
      const response = await fetch('/api/reptiles/import', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: previewData.rows,
          selectedRows: selectedRows,
          fileName: file.name
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed')
      }
      
      const result = await response.json() as ImportResponse
      setImportResult(result)
      setStep(ImportStep.COMPLETE)
      
      // Notify parent component about successful import
      if (result.success) {
        onImportComplete()
        toast.dismiss(importToastId)
        toast.success(`Successfully imported ${result.reptiles.length} reptiles`)
        
        if (result.speciesAdded > 0) {
          toast.success(`Added ${result.speciesAdded} new species`)
        }
        
        if (result.morphsAdded > 0) {
          toast.success(`Added ${result.morphsAdded} new morphs`)
        }
        
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} records had issues`, {
            description: 'See details in the summary panel'
          })
        }
      } else {
        toast.dismiss(importToastId)
        toast.error('Import completed with errors')
      }
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.message || 'Failed to import data')
      setStep(ImportStep.PREVIEW) // Go back to preview step on error
      toast.dismiss(importToastId)
      toast.error(err.message || 'Failed to import data')
    } finally {
      setIsLoading(false)
    }
  }

  // Render appropriate step content
  const renderStepContent = () => {
    switch (step) {
      case ImportStep.SELECT_FILE:
        return (
          <div className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-10 text-center ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
              
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop a CSV or Excel file, or
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={onButtonClick}
                >
                  Browse Files
                </Button>
              </div>
              
              {file && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="font-medium text-sm">Selected file:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB • {file.type}
                  </p>
                </div>
              )}
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Import Guidelines</AlertTitle>
              <AlertDescription>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                  <li>Maximum file size: 2MB</li>
                  <li>Maximum 500 rows per file</li>
                  <li>Required fields: name, sex, species, acquisition_date</li>
                  <li>CSV or Excel (.xlsx) formats only</li>
                </ul>
                <div className="mt-2">
                  <Link 
                    href="/templates/reptile_import_template.csv" 
                    className="inline-flex items-center text-sm text-primary hover:underline"
                    download
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download template
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )
        
      case ImportStep.PREVIEW:
        if (!previewData) return null
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{previewData.totalRows}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Valid Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{previewData.validRows.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Selected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{selectedRows.length}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Button variant="outline" size="sm" onClick={selectAllValidRows}>
                  Select All Valid
                </Button>
                <Button variant="outline" size="sm" className="ml-2" onClick={clearAllSelections}>
                  Clear Selection
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                {previewData.speciesCount} unique species, {previewData.morphCount} morphs will be processed
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Status</span>
                    </TableHead>
                    <TableHead className="w-12">Import</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Morph</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Length</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.map((row, index) => {
                    const isValid = previewData.validRows.includes(index)
                    const isSelected = selectedRows.includes(index)
                    const errorMessage = !isValid ? previewData.invalidRows[index] : null
                    
                    return (
                      <TableRow key={index} className={!isValid ? 'bg-red-50 dark:bg-red-950/10' : ''}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle 
                              className="h-5 w-5 text-red-500" 
                              aria-label={errorMessage || 'Error'} 
                              onClick={() => {
                                if (errorMessage) {
                                  toast.error(errorMessage, {
                                    description: `Error in row ${index + 1}`
                                  })
                                }
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(index)}
                            disabled={!isValid}
                          />
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.species}</TableCell>
                        <TableCell>{row.sex}</TableCell>
                        <TableCell>{row.morph || '-'}</TableCell>
                        <TableCell>{row.weight || '-'}</TableCell>
                        <TableCell>{row.length || '-'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )
        
      case ImportStep.IMPORTING:
        return (
          <div className="space-y-6 py-12 text-center">
            <Upload className="h-16 w-16 mx-auto text-primary animate-pulse" />
            <h3 className="text-xl font-medium">Importing Your Data</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your data...
            </p>
            <Progress value={60} className="w-2/3 mx-auto" />
            <p className="text-sm text-gray-500">
              Processing {selectedRows.length} reptiles
            </p>
          </div>
        )
        
      case ImportStep.COMPLETE:
        if (!importResult) return null
        
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              {importResult.success ? (
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              ) : (
                <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              )}
              
              <h3 className="text-xl font-medium">
                {importResult.success ? 'Import Complete!' : 'Import Completed with Issues'}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {importResult.success
                  ? `Successfully imported ${importResult.reptiles.length} reptiles.`
                  : 'The import completed with some issues. See details below.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reptiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{importResult.reptiles.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Species Added</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{importResult.speciesAdded}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Morphs Added</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{importResult.morphsAdded}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-500">{importResult.errors.length}</p>
                </CardContent>
              </Card>
            </div>
            
            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Error Details</h4>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                  <ul className="text-sm space-y-1">
                    {importResult.errors.map((error, i) => (
                      <li key={i} className="text-red-600 dark:text-red-400">• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  // Dynamic button text
  const getButtonText = () => {
    switch (step) {
      case ImportStep.SELECT_FILE:
        return file ? 'Preview' : 'Select a File'
      case ImportStep.PREVIEW:
        return `Import ${selectedRows.length} Reptiles`
      case ImportStep.IMPORTING:
        return 'Importing...'
      case ImportStep.COMPLETE:
        return 'Close'
    }
  }

  // Primary button click handler
  const handlePrimaryButtonClick = () => {
    switch (step) {
      case ImportStep.SELECT_FILE:
        if (file) handlePreview()
        break
      case ImportStep.PREVIEW:
        if (selectedRows.length > 0) handleImport()
        break
      case ImportStep.COMPLETE:
        handleOpenChange(false)
        break
    }
  }

  // Determine if primary button should be disabled
  const isPrimaryButtonDisabled = () => {
    if (isLoading) return true
    switch (step) {
      case ImportStep.SELECT_FILE:
        return !file
      case ImportStep.PREVIEW:
        return selectedRows.length === 0
      case ImportStep.IMPORTING:
        return true
      case ImportStep.COMPLETE:
        return false
    }
  }

  // Back button functionality
  const handleBack = () => {
    if (step === ImportStep.PREVIEW) {
      setStep(ImportStep.SELECT_FILE)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Import Reptiles</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to bulk import your reptile collection.
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicator */}
        <div className="flex justify-between w-full mb-6">
          {['Select File', 'Preview', 'Processing', 'Complete'].map((stepName, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center w-1/4 ${idx < step ? 'text-primary' : idx === step ? 'text-primary font-medium' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                idx < step 
                  ? 'bg-primary text-white' 
                  : idx === step 
                    ? 'border-2 border-primary text-primary' 
                    : 'border border-gray-300 text-gray-400'
              }`}>
                {idx < step ? '✓' : idx + 1}
              </div>
              <span className="mt-1 text-xs">{stepName}</span>
            </div>
          ))}
        </div>
        
        {/* Step content */}
        {renderStepContent()}
        
        {/* Dialog footer */}
        <DialogFooter className="flex justify-between">
          {step === ImportStep.PREVIEW && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          )}
          <Button 
            onClick={handlePrimaryButtonClick}
            disabled={isPrimaryButtonDisabled()}
            className={step === ImportStep.IMPORTING ? 'opacity-50 pointer-events-none' : ''}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 