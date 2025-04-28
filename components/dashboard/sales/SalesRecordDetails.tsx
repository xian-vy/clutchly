'use client';

import { SaleRecord } from '@/lib/types/sales';
import { format } from 'date-fns';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  BanknoteIcon, 
  CalendarIcon, 
  InfoIcon, 
  UserIcon 
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SalesRecordDetailsProps {
  sale: SaleRecord;
}

export function SalesRecordDetails({ sale }: SalesRecordDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{sale.buyer_name}</p>
              </div>
              {sale.buyer_email && (
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p>{sale.buyer_email}</p>
                </div>
              )}
              {sale.buyer_phone && (
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p>{sale.buyer_phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BanknoteIcon className="h-4 w-4" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <p className="font-medium">${sale.price.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Method</Label>
                <p>{sale.payment_method.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <p className="capitalize">{sale.status}</p>
              </div>
              {sale.invoice_number && (
                <div>
                  <Label className="text-xs text-muted-foreground">Invoice #</Label>
                  <p>{sale.invoice_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dates & Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Sale Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Sale Date</Label>
                <p>{format(new Date(sale.sale_date), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reptile ID</Label>
                <p>{sale.reptile_id}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Documents Included</Label>
                <p>{sale.includes_documents ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sale.shipping_details && (
                <div>
                  <Label className="text-xs text-muted-foreground">Shipping Details</Label>
                  <p>{sale.shipping_details}</p>
                </div>
              )}
              {sale.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="whitespace-pre-wrap text-sm">{sale.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 