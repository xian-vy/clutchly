import { getReptiles } from "@/app/api/reptiles/reptiles"
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
import { useSpeciesStore } from "@/lib/stores/speciesStore"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { useMemo } from "react"

interface ReptileSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function useGroupedReptiles() {
  // Get reptiles from React Query
  const { data: reptiles = [] } = useQuery({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  })

  // Get species from store
  const { species } = useSpeciesStore()

  // Group reptiles by species
  const groupedReptiles = useMemo(() => {
    return species.map(speciesItem => ({
      label: speciesItem.name,
      items: reptiles
        .filter(reptile => reptile.species_id === speciesItem.id.toString())
        .map(reptile => ({
          value: reptile.id,
          label: reptile.name,
        }))
    })).filter(group => group.items.length > 0)
  }, [species, reptiles])

  // Define ReptileSelect as a proper React component
  const ReptileSelect: React.FC<ReptileSelectProps> = React.useMemo(() => {
    return React.memo(function ReptileSelect({ value, onValueChange, placeholder = "Select a reptile..." }) {
      const [open, setOpen] = React.useState(false)
      const [expandedSpecies, setExpandedSpecies] = React.useState<string | null>(null)

      const selectedLabel = React.useMemo(() => {
        for (const group of groupedReptiles) {
          const item = group.items.find(item => item.value === value)
          if (item) return item.label
        }
        return ""
      }, [value])

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedLabel || placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[270px] p-0">
            <Command>
              <CommandInput placeholder="Search species or reptiles..." />
              <CommandEmpty>No results found.</CommandEmpty>
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
                    <div className="pl-6 border-l ml-2">
                      {group.items.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.label}
                          onSelect={() => {
                            onValueChange(item.value)
                            setOpen(false)
                          }}
                          className="py-2"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Command>
          </PopoverContent>
        </Popover>
      )
    })
  }, [groupedReptiles])

  return {
    groupedReptiles,
    ReptileSelect
  }
}