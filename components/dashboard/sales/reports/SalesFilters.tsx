'use client';

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
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export interface SalesFilterParams {
  startDate?: string;
  endDate?: string;
  priceMin?: number;
  priceMax?: number;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

interface SalesFiltersProps {
  onFilterChange: (filters: SalesFilterParams) => void;
  filters: SalesFilterParams;
}

export function SalesFilters({ onFilterChange, filters }: SalesFiltersProps) {
  const [priceRangeOpen, setPriceRangeOpen] = useState(false);

  // Price range options
  const priceRanges = [
    { min: undefined, max: undefined, label: "All Prices" },
    { min: 0, max: 100, label: "Under $100" },
    { min: 100, max: 500, label: "$100 - $500" },
    { min: 500, max: 1000, label: "$500 - $1,000" },
    { min: 1000, max: 5000, label: "$1,000 - $5,000" },
    { min: 5000, max: undefined, label: "Over $5,000" },
  ];

  // Get current price range label
  const getCurrentPriceRangeLabel = () => {
    const { priceMin, priceMax } = filters;
    
    const foundRange = priceRanges.find(
      range => range.min === priceMin && range.max === priceMax
    );
    
    return foundRange?.label || "Price Range";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Price Range Filter */}
      <Popover open={priceRangeOpen} onOpenChange={setPriceRangeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={priceRangeOpen}
            className="justify-between min-w-[150px]"
            size="sm"
          >
            {getCurrentPriceRangeLabel()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search price range..." />
            <CommandEmpty>No price range found</CommandEmpty>
            <CommandGroup>
              {priceRanges.map((range, index) => (
                <CommandItem
                  key={index}
                  value={range.label}
                  onSelect={() => {
                    onFilterChange({
                      ...filters,
                      priceMin: range.min,
                      priceMax: range.max,
                    });
                    setPriceRangeOpen(false);
                  }}
                >
                  {range.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 