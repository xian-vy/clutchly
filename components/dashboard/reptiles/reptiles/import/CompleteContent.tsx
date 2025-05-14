'use client'

import { ImportResponse } from '@/app/api/reptiles/import/process'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Network } from 'lucide-react'

interface Props {
    importResult: ImportResponse
}
const CompleteContent = ({importResult} : Props) => {
  return (
    <div className="space-y-3 xl:space-y-6 3xl:space-y-7">
    <div className="text-center py-4">
      {importResult.success ? (
        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-primary mb-4" />
      ) : (
        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-500 mb-4" />
      )}
      
      <h3 className="text-sm lg:text-base font-medium">
        {importResult.success ? 'Import Complete!' : 'Import Completed with Issues'}
      </h3>
      
      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
        {importResult.success
          ? `Successfully imported ${importResult.reptiles.length} reptiles.`
          : 'The import completed with some issues. See details below.'}
      </p>
    </div>
    
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          <Card  className='gap-0'>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap text-center font-medium">Reptiles Added</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm sm:text-lg xl:text-xl font-bold text-center">{importResult.reptiles.length}</p>
              </CardContent>
          </Card>
          <Card  className='gap-0'>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap text-center font-medium">Species Added</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm sm:text-lg xl:text-xl font-bold text-center">{importResult.speciesAdded.length}</p>
              </CardContent>
          </Card>
          <Card  className='gap-0'>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap text-center font-medium">Morphs Added</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm sm:text-lg xl:text-xl font-bold text-center">{importResult.morphsAdded.length}</p>
              </CardContent>
          </Card>       
          <Card  className='gap-0'>
              <CardHeader>
                <CardTitle className="text-xs sm:text-sm xl:text-base text-nowrap text-center font-medium">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm sm:text-lg xl:text-xl font-bold text-center">{importResult.errors.length}</p>
              </CardContent>
          </Card>  
    </div>
    
    {/* Parent relationships summary */}
    <div className="mt-4">
      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
        <Network className="h-4 w-4" />
        Parent Relationships
      </h4>
      <div className="text-sm text-muted-foreground">
        {importResult.errors.filter(e => e.includes('dam') || e.includes('sire') || e.includes('parent')).length > 0 ? (
          <Alert variant="warning" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Parent Linking Issues</AlertTitle>
            <AlertDescription>
              Some parents could not be linked. Check the error details below.
            </AlertDescription>
          </Alert>
        ) : (
          <p>All parent relationships were successfully established.</p>
        )}
      </div>
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

export default CompleteContent