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
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { useFeedersStore } from "../stores/feedersStore"

interface FeederSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

interface GroupedFeeder {
  label: string
  items: {
    value: string
    label: string
  }[]
}

export function useGroupedFeederSelect() {
  const { feederTypes, feederSizes } = useFeedersStore()

  const groupedFeeders = React.useMemo<GroupedFeeder[]>(() => {
    return feederTypes.map(types => ({
      label: types.name,
      items: feederSizes
        .filter(sizes => sizes.feeder_type_id.toString() === types.id.toString())
        .map(sizes => ({
          value: sizes.id,
          label: sizes.name,
        }))
    })).filter(group => group.items.length > 0)
  }, [feederTypes, feederSizes])

  const FeederSelect = React.useMemo(() => {
    return React.memo<FeederSelectProps>(function FeederSelect({ value, onValueChange, placeholder = "Select feeder..." }) {
      const [open, setOpen] = React.useState(false)
      const [expandedSpecies, setExpandedSpecies] = React.useState<string | null>(null)

      const selectedFeederType = React.useMemo(() => 
        value ? feederTypes.find(types => 
          types.id.toString() === feederSizes.find(
            sizes => sizes.id.toString() === value
          )?.feeder_type_id
        )?.name : null
      , [value, feederTypes, feederSizes,])

      const selectedLabel = React.useMemo(() => {
        for (const group of groupedFeeders) {
          const item = group.items.find(item => item.value === value)
          if (item) return item.label
        }
        return ""
      }, [value, groupedFeeders])

      return (
        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between  max-w-[180px]"
            >
              <span className="flex-1 truncate text-start">
                {selectedLabel?
                  `${selectedFeederType} > ${selectedLabel}` :
                  placeholder
                }
              </span>

              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[270px] p-0">
            <Command>
              <CommandInput placeholder="Search species or reptiles..." />
              <CommandEmpty>No results found.</CommandEmpty>
              {groupedFeeders.map((group) => (
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
                    <ScrollArea className="h-[150px]">
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
                    </ScrollArea>
                  )}
                </div>
              ))}
            </Command>
          </PopoverContent>
        </Popover>
      )
    })
  }, [groupedFeeders, feederTypes, feederSizes])

  return {
    groupedFeeders,
    FeederSelect
  }
}