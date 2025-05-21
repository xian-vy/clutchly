'use client'
import { getLastBackupTimes } from '@/app/api/download/download';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { BackupClient } from './DownloadData';
import { backupTypes } from '@/lib/types/download';

const DownloadTab = () => {

    const { data, isLoading } = useQuery({
        queryKey: ['backup'],
        queryFn: getLastBackupTimes,
      });

      const lastBackupTimes = data?.reduce((acc, backup) => {
        acc[backup.backup_type] = new Date(backup.created_at)
        return acc
      }, {} as Record<string, Date>) || {}
    
    
      if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )
  return (
    <div className="space-y-2 md:space-y-3 xl:space-y-5">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {backupTypes.map((type) => (
                <div key={type.id} className="rounded-lg border bg-card">
                <div className="p-6">
                    <div className="mb-4">
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <BackupClient 
                    type={type}
                    lastBackup={lastBackupTimes[type.id]}
                    />
                </div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default DownloadTab
