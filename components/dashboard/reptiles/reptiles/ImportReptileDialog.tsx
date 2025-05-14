'use client'

import { ImportPreviewResponse, ImportResponse } from '@/app/api/reptiles/import/process'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMorphsStore } from '@/lib/stores/morphsStore'
import { useSpeciesStore } from '@/lib/stores/speciesStore'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import CompleteContent from './import/CompleteContent'
import ImportingContent from './import/ImportingContent'
import PreviewFileContent from './import/PreviewFileContent'
import SelectFileContent from './import/SelectFileContent'

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
  const { addMorphToState } = useMorphsStore()
  const { addSpeciesToState } = useSpeciesStore()
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

  // Function to reorder rows so parents come before their offspring
  const reorderRowsForParentDependencies = (data: ImportPreviewResponse) => {
    if (!data || !data.rows || data.rows.length === 0) return data;
    
    // Create a map of reptile names (lowercase for case-insensitive matching)
    const nameMap = new Map<string, number>();
    data.rows.forEach((row, index) => {
      if (row.name) {
        nameMap.set(row.name.toString().toLowerCase(), index);
      }
    });
    
    // Create sets to track parents and children
    const parentIndices = new Set<number>();
    const childIndices = new Set<number>();
    
    // Identify all parents and children
    data.rows.forEach((row, index) => {
      if (row.dam_name || row.sire_name) {
        childIndices.add(index);
      }
      
      if (row.name) {
        const nameLower = row.name.toString().toLowerCase();
        // Check if this reptile is referenced as a parent by any other row
        data.rows.forEach((otherRow) => {
          if (otherRow.dam_name?.toString().toLowerCase() === nameLower ||
              otherRow.sire_name?.toString().toLowerCase() === nameLower) {
            parentIndices.add(index);
          }
        });
      }
    });
    
    // Create the new order: parents first, then non-parents
    const reorderedIndices: number[] = [];
    
    // Add all parent indices first
    data.rows.forEach((_, index) => {
      if (parentIndices.has(index)) {
        reorderedIndices.push(index);
      }
    });
    
    // Add all remaining indices
    data.rows.forEach((_, index) => {
      if (!parentIndices.has(index)) {
        reorderedIndices.push(index);
      }
    });
    
    // Reorder rows based on new order
    const reorderedRows = reorderedIndices.map(index => data.rows[index]);
    
    // Create a mapping from old indices to new indices
    const indexMap = new Map<number, number>();
    reorderedIndices.forEach((oldIndex, newIndex) => {
      indexMap.set(oldIndex, newIndex);
    });
    
    // Update validRows and invalidRows with new indices
    const newValidRows = data.validRows.map(oldIndex => indexMap.get(oldIndex) as number);
    
    const newInvalidRows: Record<number, string> = {};
    Object.entries(data.invalidRows).forEach(([oldIndexStr, errorMsg]) => {
      const oldIndex = parseInt(oldIndexStr);
      const newIndex = indexMap.get(oldIndex);
      if (newIndex !== undefined) {
        newInvalidRows[newIndex] = errorMsg;
      }
    });
    
    // Update parent relationships
    const newValidParents: Record<number, { dam?: string; sire?: string }> = {};
    Object.entries(data.parentRelationships.validParents).forEach(([oldIndexStr, parents]) => {
      const oldIndex = parseInt(oldIndexStr);
      const newIndex = indexMap.get(oldIndex);
      if (newIndex !== undefined) {
        newValidParents[newIndex] = parents;
      }
    });
    
    const newInvalidParents: Record<number, { dam?: string; sire?: string; error: string }> = {};
    Object.entries(data.parentRelationships.invalidParents).forEach(([oldIndexStr, parents]) => {
      const oldIndex = parseInt(oldIndexStr);
      const newIndex = indexMap.get(oldIndex);
      if (newIndex !== undefined) {
        newInvalidParents[newIndex] = parents;
      }
    });
    
    // Return updated data with reordered rows
    return {
      ...data,
      rows: reorderedRows,
      validRows: newValidRows,
      invalidRows: newInvalidRows,
      parentRelationships: {
        validParents: newValidParents,
        invalidParents: newInvalidParents
      }
    };
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
      
      let data = await response.json() as ImportPreviewResponse
      
      // Reorder rows to ensure parents come before their offspring
      data = reorderRowsForParentDependencies(data);
      
      setPreviewData(data)
      
      // Auto-select valid rows
      setSelectedRows(data.validRows)
      
      // Move to preview step
      setStep(ImportStep.PREVIEW)
      toast.dismiss()
      toast.success(`Found ${data.validRows.length} valid entries out of ${data.totalRows} total`)
    } catch (err: unknown) {
      console.error('Preview error:', err)
      setError(err instanceof Error ? err.message : 'Failed to preview file')
      toast.dismiss()
      toast.error(err instanceof Error ? err.message : 'Failed to preview file')
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
        
        if (result.speciesAdded.length > 0) {
          // Add new species to store
          result.speciesAdded.forEach(species => {
             addSpeciesToState(species)
             console.log("species", species)
          })
          toast.success(`Added ${result.speciesAdded.length} new species`)
        }
        
        if (result.morphsAdded.length > 0) {
          // Add new morphs to store
          result.morphsAdded.forEach(morph => {
            addMorphToState(morph)
          })
          toast.success(`Added ${result.morphsAdded.length} new morphs`)
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
    } catch (err: unknown) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'Failed to import data')
      setStep(ImportStep.PREVIEW) // Go back to preview step on error
      toast.dismiss(importToastId)
      toast.error(err instanceof Error ? err.message : 'Failed to import data')
    } finally {
      setIsLoading(false)
    }
  }

  // Render appropriate step content
  const renderStepContent = () => {
    switch (step) {
      case ImportStep.SELECT_FILE:
        return (
        <SelectFileContent
          onButtonClick={onButtonClick}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          error={error}
          dragActive={dragActive}
          handleDrop={handleDrop}
          setDragActive={setDragActive}
          file={file}
        />
        )
      case ImportStep.PREVIEW:
        if (!previewData) return null
        return (
          <PreviewFileContent
            previewData={previewData}
            error={error}
            toggleRowSelection={toggleRowSelection}
            selectedRows={selectedRows}
            selectAllValidRows={selectAllValidRows}
            clearAllSelections={clearAllSelections}
          />
        )
      case ImportStep.IMPORTING:
        return (
         <ImportingContent
          selectedRows={selectedRows}
          />
        )
      case ImportStep.COMPLETE:
        if (!importResult) return null
        return (
          <CompleteContent
            importResult={importResult}
          />
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
      <DialogContent className="sm:max-w-[720px] lg:max-w-[800px] xl:max-w-[850px] 3xl:max-w-[900px] gap-3 sm:gap-4 xl:gap-5">
        <DialogHeader>
          <DialogTitle>Import Reptiles</DialogTitle>
          <DialogDescription className='text-xs sm:text-sm'>
            Upload a CSV or Excel file to bulk import your reptile collection.
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicator */}
        <div className="flex justify-between w-full mb-3">
          {['Select File', 'Preview', 'Processing', 'Complete'].map((stepName, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center w-1/4 ${idx < step ? 'text-primary' : idx === step ? 'text-primary font-medium' : 'text-gray-400'}`}
            >
              <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full text-xs sm:text-sm flex items-center justify-center ${
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
        <DialogFooter className="flex justify-end gap-3">
          {step === ImportStep.PREVIEW && (
            <Button   size="sm" variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          )}
          <Button 
            size="sm"
            onClick={handlePrimaryButtonClick}
            disabled={isPrimaryButtonDisabled()}
            className={`${step === ImportStep.IMPORTING ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}