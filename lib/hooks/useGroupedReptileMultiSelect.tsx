import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSpeciesStore } from "@/lib/stores/speciesStore"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { useMemo } from "react"
import { Reptile } from "../types/reptile"

interface MultiReptileSelectProps {
  value: { target_type: string; target_id: string }[];
  onChange: (value: { target_type: string; target_id: string }[]) => void;
  placeholder?: string;
}
interface Props {
  reptiles: Reptile[]
}
export function useGroupedReptileMultiSelect({ reptiles }: Props) {


  // Get species from store
  const { species } = useSpeciesStore()

  // Group reptiles by species
  const groupedReptiles = useMemo(() => {
    return species.map(speciesItem => ({
      label: speciesItem.name,
      items: reptiles
        .filter(reptile => reptile.species_id.toString() === speciesItem.id.toString())
        .map(reptile => ({
          value: reptile.id,
          label: reptile.name,
        }))
    })).filter(group => group.items.length > 0)
  }, [species, reptiles])

  // Define MultiReptileSelect as a proper React component
  const MultiReptileSelect: React.FC<MultiReptileSelectProps> = React.useMemo(() => {
    return React.memo(function MultiReptileSelect({ 
      value, 
      onChange, 
      placeholder = "Select reptiles..." 
    }) {
      const [open, setOpen] = React.useState(false)
      const [expandedSpecies, setExpandedSpecies] = React.useState<string | null>(null)

      // Helper function to check if a reptile is selected
      const isReptileSelected = (reptileId: string) => {
        return value.some(target => target.target_type === 'reptile' && target.target_id === reptileId)
      }

      // Helper function to toggle a reptile selection
      const toggleReptileSelection = (reptileId: string) => {
        const exists = isReptileSelected(reptileId)
        
        if (exists) {
          onChange(
            value.filter(target => !(target.target_type === 'reptile' && target.target_id === reptileId))
          )
        } else {
          onChange([
            ...value,
            { target_type: 'reptile', target_id: reptileId }
          ])
        }
      }

      return (
        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {value.length === 0 
                ? placeholder
                : `${value.length} reptile${value.length > 1 ? 's' : ''} selected`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end" side="bottom" sideOffset={5}>
            <Command>
              <CommandInput placeholder="Search species or reptiles..." />
              <CommandEmpty>No results found.</CommandEmpty>
              <ScrollArea className="h-[250px]">
                    {groupedReptiles.map((group) => (
                      <div key={group.label}>
                        <CommandItem
                          value={group.label}
                          onSelect={() => setExpandedSpecies(
                            expandedSpecies === group.label ? null : group.label
                          )}
                          className="cursor-pointer font-medium"
                        >
                          <ChevronsUpDown className={cn(
                            "mr-2 h-4 w-4 shrink-0 transition-transform",
                            expandedSpecies === group.label ? "rotate-180" : ""
                          )} />
                          {group.label}
                        </CommandItem>
                        
                        {expandedSpecies === group.label && (
                        <ScrollArea className="h-[250px]">
                          <div className="pl-6 border-l ml-2">
                            {group.items.map((item) => (
                              <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={() => {
                                  toggleReptileSelection(item.value)
                                }}
                                className="py-2"
                              >
                                <div className="flex items-center">
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isReptileSelected(item.value) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {item.label}
                                </div>
                              </CommandItem>
                            ))}
                          </div>
                        </ScrollArea>
                        )}
                      </div>
                    ))}
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      )
    })
  }, [groupedReptiles])

  return {
    groupedReptiles,
    MultiReptileSelect
  }
} 