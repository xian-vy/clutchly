'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { HealthLogEntry } from "@/lib/types/health";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useHealthStore } from '@/lib/stores/healthStore';
import { useQuery } from '@tanstack/react-query';
import { HEALTH_STATUS_COLORS, SEVERITY_COLORS } from "@/lib/constants/colors";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
      accessorKey: 'reptile',
      header: 'Reptile', 
    },
    {
      accessorKey:'morph',
      header: 'Morph', 
    },
    {
      accessorKey:'species',
      header: 'Species', 
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
        const severity = row.getValue('severity') as keyof typeof SEVERITY_COLORS;
        return severity ? (
          <Badge variant="custom" 
            className={SEVERITY_COLORS[severity.toLowerCase() as keyof typeof SEVERITY_COLORS]}>
            {severity}
          </Badge>
        ) : '-';
      },
    },
    {
      accessorKey: 'resolved',
      header: 'Status',
      cell: ({ row }) => {
        const resolved = row.getValue('resolved') 
        const label = resolved ? 'Resolved' : 'Ongoing';
        return (
          <Badge 
            variant="custom"
            className={HEALTH_STATUS_COLORS[label.toLowerCase() as keyof typeof HEALTH_STATUS_COLORS]}
          >
            {resolved ? 'resolved' : 'ongoing'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return format(new Date(date), 'MMM d, yyyy');
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const health = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(health)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(health.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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