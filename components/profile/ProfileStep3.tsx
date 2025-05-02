'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';
import { ProfileFormValues } from './ProfileSetupDialog';
import { useSpeciesStore } from '@/lib/stores/speciesStore';

interface ProfileStep3Props {
  form: UseFormReturn<ProfileFormValues>;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function ProfileStep3({ form, onPrev, isSubmitting }: ProfileStep3Props) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load species using the species store
  const { species, isLoading: isLoadingSpecies } = useSpeciesStore();
  
  // Form values
  const selectedSpecies = form.watch('selected_species') || [];
  
  // Handle species toggle
  const toggleSpeciesSelection = (speciesId: string) => {
    const currentSpecies = form.getValues('selected_species') || [];
    
    if (currentSpecies.includes(speciesId)) {
      // Remove if already selected
      form.setValue('selected_species', 
        currentSpecies.filter(id => id !== speciesId), 
        { shouldValidate: true }
      );
    } else {
      // Add if not selected
      form.setValue('selected_species', 
        [...currentSpecies, speciesId], 
        { shouldValidate: true }
      );
    }
  };
  
  // Filter species based on search
  const filteredSpecies = searchQuery 
    ? species.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.scientific_name && s.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : species;
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center space-x-2 relative">
          <Input
            placeholder="Search species..."
            className="w-full transition-all border-input/50 focus:border-primary/50 text-base py-6 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium flex justify-between">
            <span>Select species in your collection</span>
            <span className="text-primary">{selectedSpecies.length || 0} selected</span>
          </p>
          
          {isLoadingSpecies ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2">
              {filteredSpecies.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No species found</p>
              ) : (
                filteredSpecies.map((species) => (
                  <Badge
                    key={species.id}
                    variant={selectedSpecies.includes(species.id.toString()) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer py-1.5 px-3 transition-all",
                      selectedSpecies.includes(species.id.toString()) 
                        ? "bg-primary hover:bg-primary/80" 
                        : "hover:bg-primary/10"
                    )}
                    onClick={() => toggleSpeciesSelection(species.id.toString())}
                  >
                    {species.name}
                  </Badge>
                ))
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            We&apos;ll automatically download morph data for your selected species
          </p>
          
          {form.formState.errors.selected_species && (
            <p className="text-sm text-destructive">
              {form.formState.errors.selected_species.message}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1 py-6 border-primary/20 hover:border-primary/40 font-medium text-base"
        >
          Back
        </Button>
        
        <Button 
          type="submit" 
          className="flex-1 py-6 transition-all bg-primary hover:bg-primary/90 text-white font-medium text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Setting up...
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      </div>
    </div>
  );
} 