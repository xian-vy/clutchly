'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SaleRecord } from '@/lib/types/sales';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye, Filter, MoreHorizontal, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SalesFilterDialog, SalesFiltersState } from './SalesFilterDialog';
import { PAYMENT_COLORS, SALES_STATUS_COLORS } from '@/lib/constants/colors';


// Payment method colors


export interface EnrichedSaleRecord extends SaleRecord {
  reptile_name?: string;
  species_name?: string;
  morph_name?: string;
}

interface SalesRecordListProps {
  salesRecords: EnrichedSaleRecord[];
  onEdit: (salesRecord: EnrichedSaleRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (salesRecord: EnrichedSaleRecord) => void;
}

export function SalesRecordList({
  salesRecords,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails,
}: SalesRecordListProps) {
  const [filters, setFilters] = useState<SalesFiltersState>({});
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Apply filters to the sales records
  const filteredSales = useMemo(() => {
    return salesRecords.filter(record => {
      // Status filter
      if (filters.status && filters.status !== 'all' && record.status !== filters.status) {
        return false;
      }
      
      // Payment method filter
      if (filters.paymentMethod && 
          filters.paymentMethod !== 'all' && 
          record.payment_method !== filters.paymentMethod) {
        return false;
      }
      
      // Species filter
      if (filters.speciesId && filters.speciesId !== 'all' && record.species_name && 
          !record.species_name.toLowerCase().includes(filters.speciesId.toLowerCase())) {
        return false;
      }
      
      // Morph filter
      if (filters.morphId && filters.morphId !== 'all' && record.morph_name && 
          !record.morph_name.toLowerCase().includes(filters.morphId.toLowerCase())) {
        return false;
      }
      
      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (record.price < min || record.price > max) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange) {
        const recordDate = new Date(record.sale_date);
        if (filters.dateRange.from && recordDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to) {
          const endDate = new Date(filters.dateRange.to);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (recordDate > endDate) {
            return false;
          }
        }
      }
      
      // Documentation filter
      if (filters.includesDocuments !== undefined && 
          record.includes_documents !== filters.includesDocuments) {
        return false;
      }
      
      return true;
    });
  }, [salesRecords, filters]);

  // Get active filter count for the badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.paymentMethod && filters.paymentMethod !== 'all') count++;
    if (filters.speciesId && filters.speciesId !== 'all') count++;
    if (filters.morphId && filters.morphId !== 'all') count++;
    if (filters.priceRange) count++;
    if (filters.dateRange) count++;
    if (filters.includesDocuments !== undefined) count++;
    return count;
  }, [filters]);

  const columns: ColumnDef<EnrichedSaleRecord>[] = [
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
      accessorKey: "reptile_name",
      header: "Reptile",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="max-w-[120px] truncate">
            {record.reptile_name || "Unknown"}
          </div>
        );
      }
    },
    {
      header: "SP & Morph",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="text-xs">
            <p>{record.species_name || "Unknown"}</p>
            <p>{record.morph_name || "Unknown"}</p>
          </div>
        );
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
      header: "Payment",
      cell: ({ row }) => {
        const method = row.getValue("payment_method") as keyof typeof PAYMENT_COLORS;
        const displayMethod = method.replace('_', ' ');
        return (
          <Badge
            variant="custom"
            className={`${PAYMENT_COLORS[method]} capitalize`}
          >
            {displayMethod}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof SALES_STATUS_COLORS;
        return (
          <Badge
            variant="custom"
            className={`${SALES_STATUS_COLORS[status.toLowerCase() as keyof typeof SALES_STATUS_COLORS]} capitalize`}
          >
            {status}
          </Badge>
        );
      },
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
      className="relative"
    >
      <Filter className="h-4 w-4 mr-1" />
      Filter
      {activeFilterCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute text-white rounded-sm -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 font-normal text-[0.65rem]"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <DataTable 
        columns={columns} 
        data={filteredSales} 
        onAddNew={onAddNew}
        filterButton={<CustomFilterButton />}
      />
      
      <SalesFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </>
  );
}