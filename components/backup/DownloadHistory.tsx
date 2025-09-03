'use client'

import { useQuery } from '@tanstack/react-query'
import { getBackupLogs } from '@/app/api/download/download'
import { CACHE_KEYS } from '@/lib/constants/cache_keys'

const DownloadHistory = () => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.BACKUP_LOGS],
    queryFn: getBackupLogs
  })

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Download History</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Download History</h2>
        <div className="text-destructive">
          Failed to load download history
        </div>
      </div>
    )
  }

  if (!logs?.length) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Download History</h2>
        <div className="text-muted-foreground">
          No download history available
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Download History</h2>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <span className="font-medium">{log.backup_type}</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {(log.data_size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DownloadHistory
