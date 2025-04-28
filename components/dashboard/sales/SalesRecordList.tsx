'use client';

import { SaleRecord } from '@/lib/types/sales';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { SalesFilterDialog } from './SalesFilterDialog';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Status colors for different sale statuses
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80',
  completed: 'bg-green-100 text-green-800 hover:bg-green-100/80',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-100/80',
  refunded: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
};

interface SalesRecordListProps {
  salesRecords: SaleRecord[];
  onEdit: (salesRecord: SaleRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (salesRecord: SaleRecord) => void;
}

export function SalesRecordList({
  salesRecords,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails,
}: SalesRecordListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const columns: ColumnDef<SaleRecord>[] = [
    {
      header: "#",
      cell: ({ row }) => {
        return <div className="text-left">{row.index + 1}</div>; 
      }
    },
    {
      accessorKey: "buyer_name",
      header: "Buyer",
    },
    {
      accessorKey: "invoice_number",
      header: "Invoice",
      cell: ({ row }) => {
        const invoiceNumber = row.getValue("invoice_number") as string;
        return invoiceNumber || "-";
      }
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return `$${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: "sale_date",
      header: "Sale Date",
      cell: ({ row }) => {
        const date = row.getValue("sale_date") as string;
        return format(new Date(date), 'MMM d, yyyy');
      },
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: ({ row }) => {
        const method = row.getValue("payment_method") as string;
        return method.replace('_', ' ');
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof STATUS_COLORS;
        return (
          <Badge
            variant="custom"
            className={`${STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS]} capitalize`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(record)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(record)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(record.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Custom filter button for the DataTable
  const CustomFilterButton = () => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setIsFilterDialogOpen(true)}
    >
      Filter
    </Button>
  );

  return (
    <>
      <DataTable 
        columns={columns} 
        data={salesRecords} 
        onAddNew={onAddNew}
        filterButton={<CustomFilterButton />}
      />
      
      <SalesFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </>
  );
} 