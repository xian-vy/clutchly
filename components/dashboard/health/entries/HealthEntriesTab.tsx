'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { HealthLogEntry, CreateHealthLogEntryInput } from '@/lib/types/health';
import { 
  getHealthLogs, 
  createHealthLog, 
  updateHealthLog, 
  deleteHealthLog 
} from '@/app/api/health/entries';
import { HealthLogList } from './HealthLogList';
import { HealthLogForm } from './HealthLogForm';
import { Loader2 } from 'lucide-react';

export function HealthEntriesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    resources: healthLogs,
    isLoading,
    selectedResource: selectedHealthLog,
    setSelectedResource: setSelectedHealthLog,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<HealthLogEntry, CreateHealthLogEntryInput>({
    resourceName: 'Health Log',
    queryKey: ['healthLogs'],
    getResources: getHealthLogs,
    createResource: createHealthLog,
    updateResource: updateHealthLog,
    deleteResource: deleteHealthLog,
  });

  if (isLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <HealthLogList 
        healthLogs={healthLogs}
        onEdit={(healthLog) => {
          setSelectedHealthLog(healthLog);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedHealthLog ? 'Edit Health Log' : 'Add New Health Log'}
          </DialogTitle>
          <HealthLogForm
            initialData={selectedHealthLog}
            onSubmit={async (data) => {
              console.log('Submitting health log data:', data);
              try {
                const success = selectedHealthLog
                  ? await handleUpdate(data)
                  : await handleCreate(data);
                console.log('Health log submission result:', success);
                if (success) {
                  setIsDialogOpen(false);
                  setSelectedHealthLog(undefined);
                }
              } catch (error) {
                console.error('Error submitting health log:', error);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedHealthLog(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 