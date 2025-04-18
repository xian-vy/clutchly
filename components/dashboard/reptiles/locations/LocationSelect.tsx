import { Badge } from '@/components/ui/badge';
import { FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocations } from '@/lib/hooks/useLocations';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  currentLocationId?: string | null;
}

export function LocationSelect({ value, onChange, disabled, currentLocationId }: LocationSelectProps) {
  const { availableLocations, isLoading, refetchLocations } = useLocations();
  const [locations, setLocations] = useState<any[]>([]);
  
  // Include current location in options even if it's not "available"
  useEffect(() => {
    // Create a function to fetch current location if needed
    const fetchCurrentLocation = async () => {
      if (!currentLocationId) {
        setLocations(availableLocations);
        return;
      }
      
      // If the current value is not in available locations, we need to fetch it
      const locationExists = availableLocations.some(loc => loc.id === currentLocationId);
      
      if (!locationExists && currentLocationId) {
        try {
          const response = await fetch(`/api/locations/${currentLocationId}`);
          if (response.ok) {
            const currentLocation = await response.json();
            setLocations([
              ...availableLocations,
              {
                ...currentLocation,
                displayName: currentLocation.label || `Location ${currentLocation.id}`,
                isCurrentLocation: true
              }
            ]);
          } else {
            setLocations(availableLocations);
          }
        } catch (error) {
          console.error("Error fetching current location:", error);
          setLocations(availableLocations);
        }
      } else {
        setLocations(availableLocations);
      }
    };
    
    fetchCurrentLocation();
    // Only run this effect when these dependencies change,
    // stringify availableLocations to prevent the infinite loop
  }, [currentLocationId, JSON.stringify(availableLocations)]);
  
  // Refresh locations when component mounts - only run ONCE
  useEffect(() => {
    refetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle the value change
  const handleValueChange = (newValue: string) => {
    // If "none" is selected, pass empty string to parent
    onChange(newValue === "none" ? "" : newValue);
  };
  
  return (
    <Select 
      value={value || 'none'} 
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <FormControl>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder="Select a location" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="none">No Location</SelectItem>
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{location.displayName || location.label}</span>
              {location.isCurrentLocation && (
                <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 