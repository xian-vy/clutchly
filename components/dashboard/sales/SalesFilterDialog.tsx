'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { PaymentMethod } from '@/lib/types/sales';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export interface SalesFiltersState {
  status?: string | 'all';
  paymentMethod?: PaymentMethod | 'all';
  speciesId?: string;
  morphId?: string;
  priceRange?: [number, number];
  dateRange?: DateRange;
  includesDocuments?: boolean;
}

interface SalesFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: SalesFiltersState) => void;
  currentFilters: SalesFiltersState;
}

export function SalesFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters = {},
}: SalesFilterDialogProps) {
  // Initialize filters state with current filters
  const [filters, setFilters] = useState<SalesFiltersState>(currentFilters);
  const { species } = useSpeciesStore();
  const { morphs } = useMorphsStore();
  
  // Dropdown states
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [morphOpen, setMorphOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Update local state when currentFilters changes
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  // Filter morphs based on selected species
  const filteredMorphs = filters.speciesId
    ? morphs.filter(morph => morph.species_id.toString() === filters.speciesId)
    : morphs;

  // Payment method options
  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "other", label: "Other" },
  ];

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  // Price range options
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange || [0, 5000]
  );

  // Update price range in filters
  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    setFilters(prev => ({ ...prev, priceRange: newRange }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] xl:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Filter Sales Records</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Status Filter */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? 'all' : value 
                }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={filters.paymentMethod || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  paymentMethod: value === 'all' ? 'all' : (value as PaymentMethod)
                }))
              }
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {paymentOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Species Filter */}
          <div className="grid gap-2">
            <Label>Species</Label>
            <Popover open={speciesOpen} onOpenChange={setSpeciesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={speciesOpen}
                  className="justify-between w-full"
                >
                  {filters.speciesId
                    ? species.find((s) => s.id.toString() === filters.speciesId)?.name
                    : "Select species"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 max-h-[200px] overflow-y-auto">
                <Command>
                  <CommandInput placeholder="Search species..." />
                  <CommandEmpty>No species found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() => {
                        setFilters(prev => ({ ...prev, speciesId: undefined, morphId: undefined }));
                        setSpeciesOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.speciesId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Clear selection
                    </CommandItem>
                    {species.map((s) => (
                      <CommandItem
                        key={s.id}
                        value={s.name}
                        onSelect={() => {
                          setFilters(prev => ({
                            ...prev,
                            speciesId: s.id.toString(),
                            // Clear morph if species changes
                            morphId: undefined
                          }));
                          setSpeciesOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.speciesId === s.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {s.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Morph Filter - Only active if species is selected */}
          <div className="grid gap-2">
            <Label className={!filters.speciesId ? "text-muted-foreground" : ""}>
              Morph
            </Label>
            <Popover open={morphOpen} onOpenChange={setMorphOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={morphOpen}
                  disabled={!filters.speciesId}
                  className="justify-between w-full"
                >
                  {filters.morphId
                    ? morphs.find((m) => m.id.toString() === filters.morphId)?.name
                    : "Select morph"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 max-h-[200px] overflow-y-auto">
                <Command>
                  <CommandInput placeholder="Search morphs..." />
                  <CommandEmpty>No morphs found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() => {
                        setFilters(prev => ({ ...prev, morphId: undefined }));
                        setMorphOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.morphId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Clear selection
                    </CommandItem>
                    {filteredMorphs.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={m.name}
                        onSelect={() => {
                          setFilters(prev => ({ ...prev, morphId: m.id.toString() }));
                          setMorphOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.morphId === m.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {m.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Range Filter */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Price Range</Label>
              <span className="text-xs text-muted-foreground">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={priceRange}
              min={0}
              max={5000}
              step={50}
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              className="py-4"
            />
          </div>

          {/* Date Range Filter */}
          <div className="grid gap-2">
            <Label>Sale Date Range</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "PPP")} -{" "}
                        {format(filters.dateRange.to, "PPP")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "PPP")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => {
                    setFilters(prev => ({ ...prev, dateRange: range }));
                  }}
                  numberOfMonths={2}
                />
                <div className="p-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, dateRange: undefined }));
                      setDatePickerOpen(false);
                    }}
                    className="mr-2"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setDatePickerOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Includes Documents Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includesDocuments"
              checked={filters.includesDocuments}
              onCheckedChange={(checked) => {
                setFilters(prev => ({ 
                  ...prev, 
                  includesDocuments: checked === true ? true : undefined 
                }));
              }}
            />
            <Label htmlFor="includesDocuments">Includes documentation</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}