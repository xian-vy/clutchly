'use client';

import { getReptiles } from '@/app/api/reptiles/reptiles';
import { createSalesRecord, deleteSalesRecord, getSalesRecords, updateSalesRecord } from '@/app/api/sales';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SALES_STATUS_COLORS } from '@/lib/constants/colors';
import { useResource } from '@/lib/hooks/useResource';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { NewSaleRecord, SaleRecord } from '@/lib/types/sales';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SalesRecordDetails } from './SalesRecordDetails';
import { SalesRecordForm } from './SalesRecordForm';
import { EnrichedSaleRecord, SalesRecordList } from './SalesRecordList';
import { getCurrentMonthDateRange } from '@/lib/utils';
import { SalesFilters } from './SalesFilterDialog';
import { useAuthStore } from '@/lib/stores/authStore';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

export function SalesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<EnrichedSaleRecord | null>(null);
  const currentMonthRange = getCurrentMonthDateRange();
  const [filters, setFilters] = useState<SalesFilters>({
    dateFrom: currentMonthRange.dateFrom,
    dateTo: currentMonthRange.dateTo,
  });
  const { species } = useSpeciesStore();
  const { morphs } = useMorphsStore();
  const queryClient = useQueryClient();
  const {organization} = useAuthStore()

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
    queryKey: [CACHE_KEYS.SALES, filters.dateFrom, filters.dateTo],
    getResources: async () => {
      if (!organization) return [];
      return getSalesRecords(organization,{
      startDate: filters.dateFrom,
      endDate: filters.dateTo
    })
  },
    createResource: createSalesRecord,
    updateResource: updateSalesRecord,
    deleteResource: deleteSalesRecord,
  });

  // Fetch reptiles data
  const { data: reptiles, isLoading: reptilesLoading } = useQuery({
    queryKey: [CACHE_KEYS.REPTILES],
    queryFn: async () => {
  if (!organization) return [];
   return getReptiles(organization) 
},
  });

  // Create enriched sales records with reptile information
  const enrichedSalesRecords = useMemo<EnrichedSaleRecord[]>(() => {
    if (!salesRecords || !reptiles) return [];
    
    return salesRecords.map(sale => {
      const reptile = reptiles.find(r => r.id === sale.reptile_id);
      
      // Get species and morph names
      const speciesData = reptile?.species_id ? 
        species.find(s => s.id.toString() === reptile.species_id.toString()) : null;
      const morphData = reptile?.morph_id ? 
        morphs.find(m => m.id.toString() === reptile.morph_id.toString()) : null;
      
      return {
        ...sale,
        reptile_name: reptile?.name || 'Unknown',
        species_name: speciesData?.name || 'Unknown Species',
        morph_name: morphData?.name || 'Unknown Morph',
        reptile_code : reptile?.reptile_code || '--',
      };
    });
  }, [salesRecords, reptiles, species, morphs]);

  if (salesLoading || reptilesLoading) {
    return (
      <div className='w-full flex flex-col justify-center items-center min-h-[70vh]'>
          <Loader2 className='w-4 h-4 animate-spin text-primary' />
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
        salesRecords={enrichedSalesRecords}
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
        filters={filters}
        onFiltersChange={setFilters}
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
                queryClient.invalidateQueries({ queryKey: ['reptiles'] });
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
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-screen-md">
          <DialogTitle className='flex flex-col items-start gap-2 text-base'>
            {`Sale Record: ${selectedSaleForDetails?.invoice_number || selectedSaleForDetails?.id?.slice(0, 8)}`}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="custom" className={`${SALES_STATUS_COLORS[selectedSaleForDetails?.status?.toLowerCase() as keyof typeof SALES_STATUS_COLORS]} !capitalize`}>
                      {selectedSaleForDetails?.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedSaleForDetails?.reptile_name} ({selectedSaleForDetails?.morph_name})
                  </span>
                </div>
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