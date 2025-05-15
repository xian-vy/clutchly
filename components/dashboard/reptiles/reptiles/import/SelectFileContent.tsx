'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, FileSpreadsheet, Info, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

interface Props {
  error: string | null
  file : File | null
  dragActive: boolean
  setDragActive: React.Dispatch<React.SetStateAction<boolean>>
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onButtonClick: () => void
}
const SelectFileContent = ({ file,  handleDrop, dragActive,setDragActive ,error,fileInputRef,handleFileChange,onButtonClick  } : Props) => {
  return (
    <div>
        <div className="space-y-4 sm:space-y-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-5 sm:p-7 md:p-10 text-center ${
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
              
              {!file && 
                  <>
                      <FileSpreadsheet className="mx-auto h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-400" /> 
                      <div className="mt-4">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Drag and drop a CSV or Excel file, or
                            </p>
                  
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="mt-2"
                          onClick={onButtonClick}
                        >
                          Browse Files
                        </Button>
                  </div>
                  </>
               }
              {file && (
                <div className="p-3 xl:p-5 bg-muted/40 border rounded-lg">
                  <p className="font-medium text-xs sm:text-[0.8rem] xl:text-sm mb-1">Selected file:</p>
                  <p className="text-xs xl:text-sm text-muted-foreground">
                    {file.name}
                    <RefreshCcw   onClick={onButtonClick} className="h-3 w-3 sm:w-4 sm:h-4 inline-block ml-2 cursor-pointer text-primary" />
                  </p>
                  <p className="text-xs xl:text-sm text-muted-foreground/80">
                    {(file.size / 1024).toFixed(1)} KB • {file.type}
                  </p>
                </div>
              )}
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Import Guidelines</AlertTitle>
              <AlertDescription>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-0.5 sm:space-y-1 grid lg:grid-cols-2 gap-x-3 lg:gap-x-6 max-h-[100px] md:max-h-full overflow-y-auto">
                  <>
                    <li className='text-[0.7rem] sm:text-xs xl:text-sm'>Maximum file size: 2MB</li>
                    <li className='text-[0.7rem] sm:text-xs xl:text-sm'>Required fields: name, sex, species, acquisition_date</li>
                    <li className='text-[0.7rem] sm:text-xs xl:text-sm'>Maximum 500 rows per file</li>
                  </>
                  <>
                    <li className='text-[0.7rem] sm:text-xs xl:text-sm'>Visual traits should be in format: &quot;albino, normal&quot;</li>
                    <li className='text-[0.7rem] sm:text-xs xl:text-sm'>CSV or Excel (.xlsx) formats only</li>
                    <li className='text-[0.7rem] sm:text-xs xl:text-sm'>Het traits should be in format: &quot;66% albino, 33% stripe&quot;</li>
                  </>
                </ul>
                <div className="mt-2">
                  <Link 
                    href="/templates/reptile_import_template.csv" 
                    className="inline-flex items-center text-xs sm:text-sm text-primary hover:underline"
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
    </div>
  )
}

export default SelectFileContent