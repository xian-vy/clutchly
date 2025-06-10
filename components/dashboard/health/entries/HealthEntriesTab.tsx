'use client';

import { useMemo, useState } from 'react';
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
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useQuery } from '@tanstack/react-query';

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

  const { data: reptiles = [], isLoading : isReptilesLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });


  const { species,  isLoading: speciesLoading } = useSpeciesStore()
  const { morphs, isLoading: morphsLoading } = useMorphsStore()

  const enrichedHealthLogs = useMemo(() => {
    return healthLogs.map(health => {
      const reptile = reptiles.find(reptile => reptile.id === health.reptile_id);
      const speciesName = species.find(s => s.id.toString() === reptile?.species_id.toString());
      const morphName = morphs.find(m => m.id.toString() === reptile?.morph_id.toString());
      return {
        ...health,
        reptile: reptile?.name || 'Unknown',
        species: speciesName?.name || 'Unknown',
        morph: morphName?.name || 'Unknown',
      };
    });
  }, [ healthLogs, reptiles, species, morphs ]);


  if (isLoading || isReptilesLoading || speciesLoading  || morphsLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <HealthLogList 
        healthLogs={enrichedHealthLogs}
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