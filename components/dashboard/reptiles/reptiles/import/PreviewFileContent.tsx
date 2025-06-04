import { ImportPreviewResponse } from '@/app/api/reptiles/import/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'

interface Props {
  previewData: ImportPreviewResponse
  error: string | null
  toggleRowSelection: (index: number) => void
  selectedRows: number[]
  selectAllValidRows: () => void
  clearAllSelections: () => void
}

const PreviewFileContent = ({ previewData, error, toggleRowSelection, selectedRows, selectAllValidRows, clearAllSelections} : Props) => {
  const [showDuplicates, setShowDuplicates] = useState(false)
  
  // Count rows with different statuses
  const totalRows = previewData.totalRows
  const validRows = previewData.validRows.length
  const invalidRows = Object.keys(previewData.invalidRows).length
  const duplicateNames = Object.entries(previewData.invalidRows)
    .filter(([, message]) => message.includes('already exists in your collection'))
    .length
  const otherErrors = invalidRows - duplicateNames

  // Get duplicate rows for the dialog
  const duplicateRows = previewData.rows.filter((row, index) => 
    previewData.invalidRows[index]?.includes('already exists in your collection')
  )

  return (
    <div className="space-y-5 3xl:space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className='gap-0 py-3 px-2'>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap font-medium">Total Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base xl:text-lg font-bold">{totalRows}</p>
          </CardContent>
        </Card>
        
        <Card className='gap-0 py-3 px-2'>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap font-medium">Valid Rows</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base xl:text-lg font-bold">{validRows}</p>
          </CardContent>
        </Card>
        
        <Card className='gap-0 py-3 px-2'>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm xl:text-base font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base xl:text-lg font-bold">{selectedRows.length}</p>
          </CardContent>
        </Card>
      </div>

          {/* Summary Alerts */}
          <div className="space-y-2">
            {duplicateNames > 0 && (
              <Alert variant="amber">
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center gap-2">
                  {duplicateNames} {duplicateNames === 1 ? 'reptile has' : 'reptiles have'} the same name as existing ones in your collection. 
                  These rows have been automatically excluded from import.
                  <Dialog open={showDuplicates} onOpenChange={setShowDuplicates}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="h-auto p-0 text-amber-600 dark:text-amber-400">
                        View duplicates
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Duplicate Reptiles</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Species</TableHead>
                              <TableHead>Sex</TableHead>
                              <TableHead>Morph</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {duplicateRows.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.species}</TableCell>
                                <TableCell>{row.sex}</TableCell>
                                <TableCell>{row.morph || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </AlertDescription>
              </Alert>
            )}
            
            {otherErrors > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  {otherErrors} {otherErrors === 1 ? 'row has' : 'rows have'} validation errors. 
                  Click the error icon in the table to see details.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center justify-between">
            <div>
              <Button variant="outline" size="sm" onClick={selectAllValidRows}>
                Select All Valid
              </Button>
              <Button variant="outline" size="sm" className="ml-2" onClick={clearAllSelections}>
                Clear Selection
              </Button>
            </div>
            
            <div className="text-xs sm:text-sm text-muted-foreground">
              {previewData.speciesCount} unique species, {previewData.morphCount} morphs will be processed
            </div>
          </div>
          
          <div className="border rounded-md overflow-x-auto sm:max-w-[850px] h-[180px] xl:h-[200px] 2xl:h-[210px] 3xl:!h-[300px]">
            <div className="w-[300px] sm:w-[520px] md:w-[620px] lg:w-[700px] xl:w-[780px] 3xl:w-[1000px]">
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
                    <TableHead>Visuals</TableHead>
                    <TableHead>Hets</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Dam</TableHead>
                    <TableHead>Sire</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.map((row, index) => {
                    const isValid = previewData.validRows.includes(index)
                    const isSelected = selectedRows.includes(index)
                    const errorMessage = !isValid ? previewData.invalidRows[index] : null
                    const isDuplicate = errorMessage?.includes('already exists in your collection')
                    
                    return (
                      <TableRow 
                        key={index} 
                        className={!isValid ? isDuplicate ? 'bg-yellow-50 dark:bg-yellow-950/10' : 'bg-red-50 dark:bg-red-950/10' : ''}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {isValid ? (
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          ) : (
                            <AlertCircle 
                              className={`h-5 w-5 ${isDuplicate ? 'text-yellow-500' : 'text-red-500'}`}
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
                        <TableCell>
                          {row.name}
                          {isDuplicate && (
                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                              (Duplicate)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{row.species}</TableCell>
                        <TableCell>{row.sex}</TableCell>
                        <TableCell>{row.morph || '-'}</TableCell>
                        <TableCell>{row.visual_traits || '-'}</TableCell>
                        <TableCell>{row.het_traits || '-'}</TableCell>
                        <TableCell>{row.weight || '-'}</TableCell>
                        <TableCell>{row.length || '-'}</TableCell>
                        <TableCell>
                          {row.dam_name ? (
                            <span>
                              {row.dam_name}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {row.sire_name ? (
                            <span>
                              {row.sire_name}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{row.price || '0'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
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
}

export default PreviewFileContent