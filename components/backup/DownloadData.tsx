'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Clock, Download } from 'lucide-react'
import { addDays } from 'date-fns'
import { createBackup } from '@/app/api/download/download'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BackupConfig } from '@/lib/types/download'
import { CACHE_KEYS } from '@/lib/constants/cache_keys'

interface BackupClientProps {
  type: BackupConfig
  lastBackup?: Date
}

export function BackupClient({ type, lastBackup }: BackupClientProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: addDays(new Date(), -30),
    to: new Date()
  })
  const queryClient = useQueryClient()

  const { mutate: handleBackup, isPending } = useMutation({
    mutationFn: async () => {
      const csvData = await createBackup({ 
        type: type.id,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString()
        }
      })
      
      // Create and download file
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=utf-8;'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type.id}_backup_${new Date().toISOString()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      return csvData
    },
    onSuccess: () => {
      toast.success('Backup created successfully')
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BACKUP_LOGS] })
    },
    onError: (error) => {
      console.error('Backup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create backup')
    }
  })

  const canBackup = !lastBackup || 
    (Date.now() - lastBackup.getTime()) > 60 * 60 * 1000 // 1 hour

  return (
    <div className="space-y-4 pb-6">
      {lastBackup && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Last backup</AlertTitle>
          <AlertDescription>
            {new Date(lastBackup).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                className="w-full  border rounded-md px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                className="w-full  border rounded-md px-3 py-2  text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
        <Button
          className="w-fit float-right"
          disabled={!canBackup || isPending}
          onClick={() => handleBackup()}
          size="sm"
        >
          <Download className="h-4 w-4 " />
          {isPending ? 'Creating Backup...' : canBackup ? 'Download' : 'Rate Limited'}
        </Button>
      </div>
    </div>
  )
} 