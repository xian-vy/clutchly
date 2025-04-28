'use client';

import { createSalesRecord, deleteSalesRecord, getSalesRecords, updateSalesRecord } from '@/app/api/sales';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useResource } from '@/lib/hooks/useResource';
import { NewSaleRecord, SaleRecord } from '@/lib/types/sales';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SalesRecordList } from './SalesRecordList';
import { SalesRecordForm } from './SalesRecordForm';
import { SalesRecordDetails } from './SalesRecordDetails';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Status colors for different sale statuses
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80',
  completed: 'bg-green-100 text-green-800 hover:bg-green-100/80',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-100/80',
  refunded: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
};

export function SalesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<SaleRecord | null>(null);

  const {
    resources: salesRecords,
    isLoading: salesLoading,
    selectedResource: selectedSale,
    setSelectedResource: setSelectedSale,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useResource<SaleRecord, NewSaleRecord>({
    resourceName: 'Sales Record',
    queryKey: ['sales-records'],
    getResources: getSalesRecords,
    createResource: createSalesRecord,
    updateResource: updateSalesRecord,
    deleteResource: deleteSalesRecord,
  });

  if (salesLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-6 h-6 animate-spin text-black dark:text-white' />
      </div>
    )
  }

  const handleCloseSaleDetails = () => {
    setIsDetailsDialogOpen(false);
    setSelectedSaleForDetails(null);
  }

  return (
    <div className="space-y-6">
      <SalesRecordList
        salesRecords={salesRecords}
        onEdit={(sale) => {
          setSelectedSale(sale);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onAddNew={() => setIsDialogOpen(true)}
        onViewDetails={(sale) => {
          setSelectedSaleForDetails(sale);
          setIsDetailsDialogOpen(true);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedSale ? 'Edit Sales Record' : 'Add New Sales Record'}
          </DialogTitle>
          <SalesRecordForm
            initialData={selectedSale}
            onSubmit={async (data) => {
              const success = selectedSale
                ? await handleUpdate(data)
                : await handleCreate(data);
              if (success) {
                setIsDialogOpen(false);
                setSelectedSale(undefined);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedSale(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={handleCloseSaleDetails}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle className='flex flex-col items-start gap-2 text-base'>
            {`Sale Record: ${selectedSaleForDetails?.invoice_number || selectedSaleForDetails?.id?.slice(0, 8)}`}
            <div className="flex justify-between w-full items-center">
                <Badge variant="custom"  className={`${STATUS_COLORS[selectedSaleForDetails?.status.toLowerCase() as keyof typeof STATUS_COLORS]} !capitalize`}>
                    {selectedSaleForDetails?.status}
                </Badge>
                <div className="flex gap-5">
                      <div className='flex items-center gap-2'>
                          <p className="text-xs 2xl:text-[0.8rem] 3xl:text-sm font-medium text-muted-foreground">Sale Date:</p>
                          <p className='text-xs 2xl:text-[0.8rem] 3xl:text-sm text-muted-foreground'>
                            {selectedSaleForDetails?.sale_date 
                              ? format(new Date(selectedSaleForDetails.sale_date), 'MMM d, yyyy')
                              : 'Not set'}
                          </p>
                      </div>
                      <div className='flex items-center gap-2'>
                          <p className="text-xs 2xl:text-[0.8rem] 3xl:text-sm font-medium text-muted-foreground">Price:</p>
                          <p className='text-xs 2xl:text-[0.8rem] 3xl:text-sm text-muted-foreground'>
                            ${selectedSaleForDetails?.price.toFixed(2)}
                          </p>
                      </div>
                  </div>
            </div>

          </DialogTitle>
          {selectedSaleForDetails && (
            <SalesRecordDetails
              sale={selectedSaleForDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 