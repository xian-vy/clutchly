'use client';

import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { EnrichedSaleRecord } from './SalesRecordList';

interface SalesRecordDetailsProps {
  sale: EnrichedSaleRecord;
}

export function SalesRecordDetails({ sale }: SalesRecordDetailsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 xl:gap-10">
        {/* Buyer Information */}
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold">Buyer Information</h3>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Name:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.buyer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Email:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.buyer_email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Phone:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.buyer_phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Reptile Information */}
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold">Reptile Information</h3>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Reptile Code:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.reptile_code || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Name:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.reptile_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Species:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.species_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Morph:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.morph_name || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold">Payment Information</h3>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Price:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Method:</span>
              <span className="text-xs sm:text-sm font-medium capitalize">{sale.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
              <span className="text-xs sm:text-sm font-medium capitalize">{sale.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Invoice Number:</span>
              <span className="text-xs sm:text-sm font-medium">{sale.invoice_number || 'Not assigned'}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold">Additional Information</h3>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Sale Date:</span>
              <span className="text-xs sm:text-sm font-medium">{formatDate(sale.sale_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Created:</span>
              <span className="text-xs sm:text-sm font-medium">{formatDate(sale.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Last Updated:</span>
              <span className="text-xs sm:text-sm font-medium">{formatDate(sale.updated_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Includes Documents:</span>
              <span className="text-xs sm:text-sm font-medium">
                {sale.includes_documents ? 
                  <Check className="text-green-500 h-4 w-4" /> : 
                  <X className="text-red-500 h-4 w-4" />
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      {sale.shipping_details && (
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold">Shipping Details</h3>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-xs sm:text-sm whitespace-pre-wrap">{sale.shipping_details}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {sale.notes && (
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-base xl:text-lg font-semibold">Notes</h3>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-xs sm:text-sm whitespace-pre-wrap">{sale.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
} 