'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { useResource } from '@/lib/hooks/useResource';
import { HealthLogEntry, CreateHealthLogEntryInput } from '@/lib/types/health';
import { 
  getHealthLogs, 
  createHealthLog, 
  updateHealthLog, 
  deleteHealthLog 
} from '@/app/api/health/entries';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { HealthLogDialog } from './HealthLogDialog';
import { useHealthStore } from '@/lib/stores/healthStore';
import { HealthLogCategory, HealthLogSubcategory, HealthLogType } from '@/lib/types/health';

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

  const { 
    categories, 
    subcategories: allSubcategories, 
    types: allTypes,
    fetchAllData,
    getSubcategoriesByCategory,
    getTypesBySubcategory
  } = useHealthStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const columns: ColumnDef<HealthLogEntry>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return format(new Date(date), 'MMM d, yyyy');
      },
    },
    {
      accessorKey: 'category_id',
      header: 'Category',
      cell: ({ row }) => {
        const categoryId = row.getValue('category_id') as string;
        const category = categories.find((c: HealthLogCategory) => c.id === categoryId);
        return category?.label || '-';
      },
    },
    {
      accessorKey: 'subcategory_id',
      header: 'Subcategory',
      cell: ({ row }) => {
        const subcategoryId = row.getValue('subcategory_id') as string;
        const categoryId = row.original.category_id;
        const subcategory = getSubcategoriesByCategory(categoryId)
          .find((s: HealthLogSubcategory) => s.id === subcategoryId);
        return subcategory?.label || '-';
      },
    },
    {
      accessorKey: 'type_id',
      header: 'Type',
      cell: ({ row }) => {
        const typeId = row.getValue('type_id') as string | null;
        const subcategoryId = row.original.subcategory_id;
        const customTypeLabel = row.original.custom_type_label;
        
        if (typeId === null && customTypeLabel) {
          return customTypeLabel;
        }
        
        const type = getTypesBySubcategory(subcategoryId)
          .find((t: HealthLogType) => t.id === typeId);
        return type?.label || '-';
      },
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.getValue('severity') as string;
        return severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : '-';
      },
    },
    {
      accessorKey: 'resolved',
      header: 'Status',
      cell: ({ row }) => {
        const resolved = row.getValue('resolved') as boolean;
        return resolved ? 'Resolved' : 'Active';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const healthLog = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedHealthLog(healthLog);
                setIsDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(healthLog.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleAddNew = () => {
    setSelectedHealthLog(undefined);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedHealthLog(undefined);
  };

  const handleDialogSubmit = async (data: CreateHealthLogEntryInput) => {
    if (selectedHealthLog) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={healthLogs}
        onAddNew={handleAddNew}
      />
      
      <HealthLogDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        healthLog={selectedHealthLog}
      />
    </div>
  );
} 