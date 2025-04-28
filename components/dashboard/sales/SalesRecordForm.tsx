'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { BanknoteIcon, CalendarIcon, FileTextIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { useForm, Resolver } from 'react-hook-form';
import * as z from 'zod';
import { NewSaleRecord, SaleRecord } from '@/lib/types/sales';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@radix-ui/react-tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SALES_STATUS_COLORS } from '@/lib/constants/colors';

// Define form schema with Zod
const formSchema = z.object({
  reptile_id: z.string({ required_error: 'Please select a reptile' }),
  sale_date: z.date({ required_error: 'Please select a date' }),
  price: z.coerce
    .number()
    .positive('Price must be positive')
    .min(0.01, 'Price must be at least 0.01'),
  buyer_name: z.string().min(2, 'Name must be at least 2 characters'),
  buyer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  buyer_phone: z.string().optional(),
  payment_method: z.enum(['cash', 'bank_transfer', 'credit_card', 'paypal', 'other']),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  invoice_number: z.string().optional(),
  shipping_details: z.string().optional(),
  notes: z.string().optional(),
  includes_documents: z.boolean().default(false),
});

// Extract the type from the schema
type FormValues = z.infer<typeof formSchema>;


interface SalesRecordFormProps {
  initialData?: SaleRecord;
  onSubmit: (data: NewSaleRecord) => Promise<void>;
  onCancel: () => void;
}

export function SalesRecordForm({ initialData, onSubmit, onCancel }: SalesRecordFormProps) {
  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });
  
  const { ReptileSelect } = useGroupedReptileSelect({ filteredReptiles: reptiles });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      reptile_id: initialData?.reptile_id || '',
      sale_date: initialData ? new Date(initialData.sale_date) : new Date(),
      price: initialData?.price || 0,
      buyer_name: initialData?.buyer_name || '',
      buyer_email: initialData?.buyer_email || '',
      buyer_phone: initialData?.buyer_phone || '',
      payment_method: initialData?.payment_method || 'cash',
      status: initialData?.status || 'pending',
      invoice_number: initialData?.invoice_number || '',
      shipping_details: initialData?.shipping_details || '',
      notes: initialData?.notes || '',
      includes_documents: initialData?.includes_documents || false,
    },
  });

  const handleFormSubmit = form.handleSubmit(async (data: FormValues) => {
    const formattedData: NewSaleRecord = {
      ...data,
      sale_date: data.sale_date.toISOString().split('T')[0],
    };
    
    await onSubmit(formattedData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="basic" >
          <TabsList >
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="buyer">Buyer</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-2 sm:space-y-3 2xl:space-y-5 mt-2 sm:mt-4">        
                <Card className="">
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-base font-medium">Sale Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reptile_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reptile</FormLabel>
                            <FormControl>
                              <ReptileSelect
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select a reptile"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sale_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Sale Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="pl-7"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a status">
                                    {field.value && (
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn(SALES_STATUS_COLORS[field.value], "capitalize")}>
                                          {field.value}
                                        </Badge>
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <span className="flex items-center gap-2">
                                    <Badge variant="outline" className={SALES_STATUS_COLORS.pending}>Pending</Badge>
                                  </span>
                                </SelectItem>
                                <SelectItem value="completed">
                                  <span className="flex items-center gap-2">
                                    <Badge variant="outline" className={SALES_STATUS_COLORS.completed}>Completed</Badge>
                                  </span>
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  <span className="flex items-center gap-2">
                                    <Badge variant="outline" className={SALES_STATUS_COLORS.cancelled}>Cancelled</Badge>
                                  </span>
                                </SelectItem>
                                <SelectItem value="refunded">
                                  <span className="flex items-center gap-2">
                                    <Badge variant="outline" className={SALES_STATUS_COLORS.refunded}>Refunded</Badge>
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>
          <TabsContent value="buyer" className="space-y-2 sm:space-y-3 2xl:space-y-5 mt-2 sm:mt-4">
              <Card className="">
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-base font-medium">Buyer Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="buyer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buyer Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyer_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buyer Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buyer Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
            <TabsContent value="payment" className="space-y-2 sm:space-y-3 2xl:space-y-5 mt-2 sm:mt-4">
                <Card className="">
                <CardContent >
                  <div className="flex items-center gap-2 mb-4">
                    <BanknoteIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-base font-medium">Payment & Shipping Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoice_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping_details"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Shipping Details</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includes_documents"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel>Includes Documents</FormLabel>
                            <FormDescription>
                              Includes ownership transfer documents
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any additional information about this sale" 
                    className="min-h-[100px] resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="gap-1">
            {initialData ? 'Update' : 'Create'} Sale Record
          </Button>
        </div>
      </form>
    </Form>
  );
} 