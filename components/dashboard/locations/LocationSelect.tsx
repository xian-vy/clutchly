import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocations } from '@/lib/hooks/useLocations';
import { FormattedLocation } from '@/lib/types/location';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  currentLocationId?: string | null;
  filterByAvailability?: boolean;
}

export function LocationSelect({ value, onChange, disabled, currentLocationId,filterByAvailability }: LocationSelectProps) {
  const { availableLocations, isLoading, refetchLocations,setSelectedLocationId } = useLocations();
  const [open, setOpen] = useState(false);
  


  useEffect(() => {
    refetchLocations();
  }, []);
  useEffect(() => {

    if (currentLocationId) {
      setSelectedLocationId(currentLocationId);
    }
  }, [currentLocationId]);

  // Group locations by room and rack for better organization
  const groupedLocations = availableLocations?.reduce((acc: Record<string, FormattedLocation[]>, location) => {
    const roomKey = location.roomName  || 'Unknown Room';
    if (!acc[roomKey]) {
      acc[roomKey] = [];
    }
    acc[roomKey].push(location);
    return acc;
  }, {});

  // Find the currently selected location for display
  const selectedLocation = value ? availableLocations.find(loc => loc.id === value) : null;
  
  return (
    <div className="flex gap-2">
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-foreground truncate",
              !selectedLocation && "text-muted-foreground"
            )}
            disabled={disabled || isLoading}
          >
            {selectedLocation ? (
              <div className="flex items-center gap-2 min-w-0 w-full truncate">
                <span className="truncate">{selectedLocation.displayName.length > 20 ? `${selectedLocation.displayName.slice(0, 20)}...` : selectedLocation.displayName}</span>
                {/* {selectedLocation && (
                  <Badge variant="outline" className="flex-shrink-0 text-xs">Current</Badge>
                )} */}
              </div>
            ) : (
              "Select location..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Search location..." className="h-9" />
            <CommandList>
              <CommandEmpty>No locations found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  No Location
                </CommandItem>
              </CommandGroup>
              
              {Object.entries(groupedLocations).map(([roomName, roomLocations]) => (
                <CommandGroup heading={roomName} key={roomName}>
                  {roomLocations
                  .filter((location) => {
                    // Filter locations based on availability if the prop is set
                    if (filterByAvailability) {
                      return location.is_available;
                    }
                    return true;
                  })
                  .map((location) => {
                    // Split display name into parts, so we can emphasize the rack and location
                    const parts = (location.displayName || location.label || '').split('>');
                    
                    return (
                      <CommandItem
                        key={location.id}
                        value={location.id}
                        onSelect={(currentValue) => {
                          onChange(currentValue === value ? "" : currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === location.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 opacity-70" />
                          {parts.length > 1 ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{parts[parts.length-2].trim()} &gt; {parts[parts.length-1].trim()}</span>
                              <span className="text-xs text-muted-foreground">{parts.slice(0, parts.length-2).join(' > ').trim()}</span>
                            </div>
                          ) : (
                            <span>{location.displayName || location.label}</span>
                          )}
                          {/* {selectedLocation && (
                            <Badge variant="outline" className="ml-auto text-xs">Current</Badge>
                          )} */}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
    </div>
  );
}