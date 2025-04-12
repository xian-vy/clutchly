'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { HealthLogEntry } from "@/lib/types/health";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useHealthStore } from '@/lib/stores/healthStore';
import { useQuery } from '@tanstack/react-query';

interface HealthLogListProps {
  healthLogs: HealthLogEntry[];
  onEdit?: (healthLog: HealthLogEntry) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export function HealthLogList({ healthLogs, onEdit, onDelete, onAddNew }: HealthLogListProps) {
  const { 
    categories, 
    getSubcategoriesByCategory,
    getTypesBySubcategory,
    fetchAllData,
    isLoading: healthStoreLoading
  } = useHealthStore();

  // Use TanStack Query only for the initial load of health data
  const { isLoading: healthQueryLoading } = useQuery({
    queryKey: ['health-initial-load'],
    queryFn: async () => {
      // Only fetch if we don't have categories in the store
      if (categories.length === 0) {
        await fetchAllData();
      }
      return categories;
    },
    // Only run once on component mount
    enabled: categories.length === 0,
    // Don't refetch on window focus or reconnect
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Don't consider data stale
    staleTime: Infinity,
  });

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
        const category = categories.find(c => c.id === categoryId);
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
          .find(s => s.id === subcategoryId);
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
          .find(t => t.id === typeId);
        return type?.label || '-';
      },
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.getValue('severity') as string;
        return severity ? (
          <Badge variant="outline" className="capitalize">
            {severity}
          </Badge>
        ) : '-';
      },
    },
    {
      accessorKey: 'resolved',
      header: 'Status',
      cell: ({ row }) => {
        const resolved = row.getValue('resolved') as boolean;
        return (
          <Badge 
            variant={resolved ? "outline" : "destructive"}
            className={resolved ? "bg-green-100 text-green-800" : ""}
          >
            {resolved ? 'Resolved' : 'Active'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const healthLog = row.original;
        return (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit?.(healthLog)}
            >
              <Edit strokeWidth={1.5} className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete?.(healthLog.id)}
            >
              <Trash2 strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const isLoading = healthStoreLoading || healthQueryLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <DataTable columns={columns} data={healthLogs} onAddNew={onAddNew} />;
} 