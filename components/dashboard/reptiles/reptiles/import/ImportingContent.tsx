import { Progress } from '@/components/ui/progress'
import { Upload } from 'lucide-react'
import React from 'react'
interface Props {
    selectedRows: number[]
}
const ImportingContent = ({selectedRows}: Props) => {
  return (
    <div className="space-y-3 xl:space-y-4 3xl:space-y-6 text-center">
        <Upload className="h-6 w-6 sm:h-8 sm:w-8  mx-auto text-primary animate-pulse" />
        <h3 className="text-sm lg:text-base font-medium">Importing Your Data</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
        Please wait while we process your data...
        </p>
        <Progress value={60} className="w-2/3 mx-auto" />
        <p className="text-xs sm:text-sm text-muted-foreground">
        Processing {selectedRows.length} reptiles
        </p>
  </div>
  )
}

export default ImportingContent