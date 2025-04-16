import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMorphsStore } from "@/lib/stores/morphsStore";
import { cn } from "@/lib/utils";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { ReptileFilters } from "../dashboard/reptiles/reptiles/ReptileFilterDialog";
import { useSpeciesStore } from "@/lib/stores/speciesStore";

interface Props {
  field: ControllerRenderProps<ReptileFilters, "morphs">;
}

export function VirtualizedMorphSelect({ field }: Props) {
  const [morphSearchTerm, setMorphSearchTerm] = useState("");
  const [morphCommandOpen, setMorphCommandOpen] = useState(false);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const { morphs } = useMorphsStore();
  const {  species } = useSpeciesStore();

  // Create enhanced morphs with species information
  const enhancedMorphs = useMemo(() => {
    return morphs.map(morph => {
      const speciesInfo = species.find(s => s.id === morph.species_id);
      return {
        ...morph,
        speciesName: speciesInfo?.name || 'Unknown Species',
        uniqueValue: `${morph.id}-${morph.name}-${speciesInfo?.name || 'unknown'}`
      };
    });
  }, [morphs, species]);

  // Filter morphs based on search term
  const filteredMorphs = useMemo(() => { 
    const searchTerms = morphSearchTerm.toLowerCase().split(' ').filter(Boolean);
    if (searchTerms.length === 0) return enhancedMorphs;
    
    return enhancedMorphs.filter((morph) => 
      searchTerms.every(term => 
        morph.name.toLowerCase().includes(term) || 
        morph.speciesName.toLowerCase().includes(term)
      )
    );
  }, [enhancedMorphs, morphSearchTerm]);

  // Create virtualizer with the filtered items
  const rowVirtualizer = useVirtualizer({
    count: filteredMorphs.length,
    getScrollElement: () => scrollableRef.current,
    estimateSize: () => 35,
    overscan: 5,
    // Key to force recalculation when filtered items change
    getItemKey: (index) => filteredMorphs[index]?.id || index,
  });

  // Reset scroll position when search term changes
  useEffect(() => {
    if (morphSearchTerm && filteredMorphs.length > 0 && rowVirtualizer) {
      // Find the first index that matches the search term exactly
      const firstMatchIndex = filteredMorphs.findIndex(morph => 
        morph.name.toLowerCase().includes(morphSearchTerm.toLowerCase())
      );
      
      if (firstMatchIndex !== -1) {
        // Scroll to the first match with a small delay to ensure rendering is complete
        setTimeout(() => {
          rowVirtualizer.scrollToIndex(firstMatchIndex, { align: 'center' });
        }, 50);
      }
    } else if (!morphSearchTerm && rowVirtualizer) {
      // Reset to top when search is cleared
      rowVirtualizer.scrollToIndex(0);
    }
  }, [morphSearchTerm, filteredMorphs, rowVirtualizer]);

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Morphs</FormLabel>
      <Popover open={morphCommandOpen} onOpenChange={setMorphCommandOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={morphCommandOpen}
              className="justify-between w-[280px]"    
            >
              {field.value?.length 
                ? `${field.value.length} morph${field.value.length > 1 ? 's' : ''} selected` 
                : "Select morphs"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command shouldFilter={false}> {/* Disable built-in filtering */}
            <CommandInput 
              placeholder="Search morphs..." 
              value={morphSearchTerm}
              onValueChange={setMorphSearchTerm}
              className="border-none focus:ring-0"
            />
            <CommandEmpty>No morphs found.</CommandEmpty>
            {filteredMorphs.length > 0 && (
              <CommandGroup>
                <div 
                  ref={scrollableRef} 
                  className="h-60 overflow-auto"
                >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const morph = filteredMorphs[virtualRow.index];
                      if (!morph) return null;
                      
                      return (
                        <CommandItem
                          key={morph.id}
                          value={morph.uniqueValue}
                          onSelect={() => {
                            const morphId = morph.id.toString();
                            const newValue = field.value?.includes(morphId)
                              ? field.value.filter((id: string)  => id !== morphId)
                              : [...(field.value || []), morphId];
                            field.onChange(newValue);
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value?.includes(morph.id.toString()) 
                                ? "opacity-100" 
                                : "opacity-0"
                            )}
                          />
                          <span className="flex-1 truncate">
                            {morph.name} <span className="text-muted-foreground">({morph.speciesName})</span>
                          </span>
                        </CommandItem>
                      );
                    })}
                  </div>
                </div>
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-1 mt-2">
        {field.value?.map((morphId : string) => {
          const morph = enhancedMorphs.find((m) => m.id.toString() === morphId);
          return morph ? (
            <Badge 
              key={morphId}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {morph.name} <span className="text-xs text-muted-foreground">({morph.speciesName})</span>
              <button
                type="button"
                onClick={() => {
                  field.onChange(field.value?.filter((id : string) => id !== morphId));
                }}
                className="ml-1 rounded-full hover:bg-muted"
              >
                ✕
              </button>
            </Badge>
          ) : null;
        })}
      </div>
    </FormItem>
  );
}