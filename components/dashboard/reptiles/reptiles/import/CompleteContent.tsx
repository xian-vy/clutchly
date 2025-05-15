'use client'

import { ImportResponse } from '@/app/api/reptiles/import/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
    importResult: ImportResponse
}

const CompleteContent = ({importResult} : Props) => {
  return (
    <div className="space-y-3 xl:space-y-6 3xl:space-y-7">
    <div className="text-center py-2 2xl:py-4">
      {importResult.success ? (
        <CheckCircle strokeWidth={1.5} className="h-6 w-6 sm:h-7 sm:w-7 mx-auto text-primary mb-4" />
      ) : (
        <AlertCircle  strokeWidth={1.5} className="h-6 w-6 sm:h-7 sm:w-7 mx-auto text-red-500 mb-4" />
      )}
      
      <h3 className="text-sm lg:text-base font-medium">
        {importResult.success ? 'Import Complete!' : 'Import Completed with Issues'}
      </h3>
      
      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
      <div className="text-sm text-muted-foreground">
        {importResult.errors.filter(e => e.includes('dam') || e.includes('sire') || e.includes('parent')).length > 0 ? (
         <p className='text-center text-xs xl:text-sm'>Some parents could not be linked. Check the error details below.</p>
        ) : (
          <p className='text-center'>All parent relationships were successfully established</p>
        )}
      </div>
    </div>
    
    {importResult.errors.length > 0 && (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full text-red-500">
            Show {importResult.errors.length} errors
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <ul className="text-xs xl:text-sm space-y-1">
              {importResult.errors.map((error, i) => (
                <li key={i} className="text-red-600 dark:text-red-400">• {error}</li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    )}
  </div>
  )
}

export default CompleteContent