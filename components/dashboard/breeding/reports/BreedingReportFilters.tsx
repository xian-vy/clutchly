'use client';

import { BreedingReportFilters as FiltersType } from '@/app/api/breeding/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Species } from '@/lib/types/species';
import { Check, ChevronsUpDown, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BreedingReportFiltersProps {
  onFilterChange: (filters: FiltersType) => void;
  filters: FiltersType;
  species: Species[];
}

export function BreedingReportFilters({
  onFilterChange,
  filters,
  species
}: BreedingReportFiltersProps) {
  const [open, setOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(filters.speciesIds || []);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(filters.status || []);
  
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'planned', label: 'Planned' },
    { value: 'failed', label: 'Failed' }
  ];
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      ...filters,
      speciesIds: selectedSpecies.length > 0 ? selectedSpecies : undefined,
      status: selectedStatus.length > 0 ? selectedStatus : undefined
    });
    setOpen(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedSpecies([]);
    setSelectedStatus([]);
    onFilterChange({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    setOpen(false);
  };
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedSpecies.length > 0) count++;
    if (selectedStatus.length > 0) count++;
    return count;
  };
  
  // Handle species selection
  const handleSpeciesChange = (value: string) => {
    setSelectedSpecies(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  
  // Handle status selection
  const handleStatusChange = (value: string) => {
    setSelectedStatus(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  
  // Get species name by ID
  const getSpeciesName = (id: string) => {
    const found = species.find(s => s.id.toString() === id);
    return found ? found.name : 'Unknown Species';
  };
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="h-5 px-1 rounded-sm font-normal">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          <Card className="border-0">
            <CardContent className="p-0">
              <div className="border-b px-3 py-2">
                <h4 className="font-medium text-sm">Filter Reports</h4>
                <p className="text-muted-foreground text-xs">
                  Narrow down reports based on specific criteria
                </p>
              </div>
              
              <div className="px-3 py-2 border-b">
                <h5 className="text-sm font-medium mb-2">Species</h5>
                <Command>
                  <CommandInput placeholder="Search species..." />
                  <CommandList className="h-[120px] overflow-auto">
                    <CommandEmpty>No species found.</CommandEmpty>
                    <CommandGroup>
                      {species.map(s => (
                        <CommandItem 
                          key={s.id}
                          value={s.name}
                          onSelect={() => handleSpeciesChange(s.id.toString())}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Checkbox 
                            id={`species-${s.id}`}
                            checked={selectedSpecies.includes(s.id.toString())}
                            onCheckedChange={() => handleSpeciesChange(s.id.toString())}
                          />
                          <span>{s.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              
              <div className="px-3 py-2 border-b">
                <h5 className="text-sm font-medium mb-2">Project Status</h5>
                <div className="space-y-2">
                  {statusOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`status-${option.value}`}
                        checked={selectedStatus.includes(option.value)}
                        onCheckedChange={() => handleStatusChange(option.value)}
                      />
                      <label 
                        htmlFor={`status-${option.value}`}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-3 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      
      {/* Active filters display */}
      <div className="flex flex-wrap gap-1.5">
        {selectedSpecies.map(id => (
          <Badge 
            key={`species-${id}`} 
            variant="outline"
            className="h-8 gap-1 pl-2 pr-1 flex items-center"
          >
            <span className="text-xs">{getSpeciesName(id)}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => {
                handleSpeciesChange(id);
                applyFilters();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {selectedStatus.map(status => (
          <Badge 
            key={`status-${status}`} 
            variant="outline"
            className="h-8 gap-1 pl-2 pr-1 flex items-center capitalize"
          >
            <span className="text-xs">{status}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => {
                handleStatusChange(status);
                applyFilters();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
} 