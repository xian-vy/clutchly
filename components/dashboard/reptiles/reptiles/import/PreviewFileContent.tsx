import { ImportPreviewResponse } from '@/app/api/reptiles/import/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  previewData: ImportPreviewResponse
  error: string | null
  toggleRowSelection: (index: number) => void
  selectedRows: number[]
  selectAllValidRows: () => void
  clearAllSelections: () => void
}
const PreviewFileContent = ({ previewData, error, toggleRowSelection,selectedRows, selectAllValidRows, clearAllSelections} : Props) => {
  return (
    <div className="space-y-5 3xl:space-y-6">
            <div className="grid grid-cols-3 gap-4">
            <Card  className='gap-0'>
                <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap font-medium">Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm sm:text-base xl:text-lg font-bold">{previewData.totalRows}</p>
                </CardContent>
            </Card>
            
            <Card  className='gap-0'>
                <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap font-medium">Valid Rows</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm sm:text-base xl:text-lg font-bold">{previewData.validRows.length}</p>
                </CardContent>
            </Card>
            
            <Card  className='gap-0'>
                <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base font-medium">Selected</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm sm:text-base xl:text-lg font-bold">{selectedRows.length}</p>
                </CardContent>
            </Card>
            </div>
            
            <div className="flex flex-col  items-start gap-2 md:flex-row md:items-center justify-between">
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
            
            <div className="border rounded-md  overflow-x-auto sm:max-w-[850px] h-[200px] xl:h-[260px] 3xl:h-[350px]">
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
                    
                    // Parent relationship status
                // const hasParents = row.dam_name || row.sire_name
                // const hasParentError = previewData.parentRelationships.invalidParents[index]
                // const parentErrorMessage = hasParentError ? hasParentError.error : null
                    
                    return (
                    <TableRow key={index} className={!isValid ? 'bg-red-50 dark:bg-red-950/10' : ''}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                        {isValid ? (
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-primary" />
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
                        <TableCell>
                        {row.name}
                        
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