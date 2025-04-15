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
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"


interface SelectListProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

interface UseSelectListProps<T> {
  data: T[]
  getValue: (item: T) => string
  getLabel: (item: T) => string
  disabled?: boolean
}

export function useSelectList<T>({ data, getValue, getLabel, disabled }: UseSelectListProps<T>) {
  // Format items for the select
  const itemsList = useMemo(() => {
    return data.map(item => ({
      value: getValue(item),
      label: getLabel(item),
    }))
  }, [data, getValue, getLabel])

  // Define Select as a proper React component
  const Select: React.FC<SelectListProps> = React.useMemo(() => {
    return React.memo(function Select({ value, onValueChange, placeholder = "Select an item..." }) {
      const [open, setOpen] = React.useState(false)

      const selectedLabel = React.useMemo(() => {
        const item = itemsList.find(item => item.value === value)
        return item ? item.label : ""
      }, [value])

      return (
        <Popover modal={true}  open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
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
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search items..." />
              <CommandEmpty>No items found.</CommandEmpty>
              <ScrollArea className="h-[200px]">
                {itemsList.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onValueChange(item.value)
                      setOpen(false)
                    }}
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
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      )
    })
  }, [itemsList])

  return {
    itemsList,
    Select
  }
}