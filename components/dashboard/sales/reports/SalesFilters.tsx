'use client';

import { useSpeciesStore } from "@/lib/stores/speciesStore";
import { SaleStatus, PaymentMethod } from "@/lib/types/sales";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface SalesFilterParams {
  speciesId?: string;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  priceMin?: number;
  priceMax?: number;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface SalesFiltersProps {
  onFilterChange: (filters: SalesFilterParams) => void;
  filters: SalesFilterParams;
}

export function SalesFilters({ onFilterChange, filters }: SalesFiltersProps) {
  const { species } = useSpeciesStore();
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  
  // Status options
  const statusOptions: { value: SaleStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  // Payment method options
  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {/* Species Filter */}
      <Popover open={speciesOpen} onOpenChange={setSpeciesOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={speciesOpen}
            className="justify-between min-w-[150px]"
            size="sm"
          >
            {filters.speciesId
              ? species.find((s) => s.id === filters.speciesId)?.name || "Select species"
              : "Species"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search species..." />
            <CommandEmpty>No species found</CommandEmpty>
            <CommandGroup>
              {species.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.name}
                  onSelect={() => {
                    onFilterChange({
                      ...filters,
                      speciesId: filters.speciesId === s.id ? undefined : s.id,
                    });
                    setSpeciesOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filters.speciesId === s.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Status Filter */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={statusOpen}
            className="justify-between min-w-[120px]"
            size="sm"
          >
            {filters.status
              ? statusOptions.find((s) => s.value === filters.status)?.label || "Status"
              : "Status"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search status..." />
            <CommandEmpty>No status found</CommandEmpty>
            <CommandGroup>
              {statusOptions.map((s) => (
                <CommandItem
                  key={s.value}
                  value={s.label}
                  onSelect={() => {
                    onFilterChange({
                      ...filters,
                      status: filters.status === s.value ? undefined : s.value,
                    });
                    setStatusOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filters.status === s.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {s.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Payment Method Filter */}
      <Popover open={paymentMethodOpen} onOpenChange={setPaymentMethodOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={paymentMethodOpen}
            className="justify-between min-w-[150px]"
            size="sm"
          >
            {filters.paymentMethod
              ? paymentOptions.find((p) => p.value === filters.paymentMethod)?.label || "Payment"
              : "Payment Method"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search payment method..." />
            <CommandEmpty>No payment method found</CommandEmpty>
            <CommandGroup>
              {paymentOptions.map((p) => (
                <CommandItem
                  key={p.value}
                  value={p.label}
                  onSelect={() => {
                    onFilterChange({
                      ...filters,
                      paymentMethod: filters.paymentMethod === p.value ? undefined : p.value,
                    });
                    setPaymentMethodOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filters.paymentMethod === p.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {p.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 