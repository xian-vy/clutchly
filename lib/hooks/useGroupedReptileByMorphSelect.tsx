import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useMemo } from "react";
import { Reptile } from "../types/reptile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMorphsStore } from "../stores/morphsStore";

interface ReptileSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

interface Props {
  filteredReptiles: Reptile[];
  disabled: boolean;
}

export function useGroupedReptileByMorphSelect({
  filteredReptiles,
  disabled,
}: Props) {
  // Get species from store
  const { morphs } = useMorphsStore();

  // Group reptiles by species
  const groupedReptiles = useMemo(() => {
    return morphs
      .map((morphItem) => ({
        label: morphItem.name,
        items: filteredReptiles
          .filter(
            (reptile) => reptile.morph_id.toString() === morphItem.id.toString()
          )
          .map((reptile) => ({
            value: reptile.id,
            label: reptile.name,
            code: reptile.reptile_code,
            searchValue: `${reptile.name} ${reptile.reptile_code}`, // For search functionality
          })),
      }))
      .filter((group) => group.items.length > 0);
  }, [morphs, filteredReptiles]);

  // Define ReptileSelect as a proper React component
  const ReptileSelect: React.FC<ReptileSelectProps> = React.useMemo(() => {
    return React.memo(function ReptileSelect({
      value,
      onValueChange,
      placeholder = "Select a reptile...",
    }) {
      const [open, setOpen] = React.useState(false);
      const [expandedSpecies, setExpandedSpecies] = React.useState<
        string | null
      >(null);

      const selectedLabel = React.useMemo(() => {
        for (const group of groupedReptiles) {
          const item = group.items.find((item) => item.value === value);
          if (item)
            return (
              <div className="flex flex-col items-start">
                <span>{item.label}</span>
              </div>
            );
        }
        return "";
      }, [value]);

      return (
        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between overflow-hidden"
            >
              <div className="truncate">{selectedLabel || placeholder}</div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[270px] p-0">
            <Command>
              <CommandInput placeholder="Search by name or code..." />
              <CommandEmpty>No results found.</CommandEmpty>
              <ScrollArea className="h-[250px]">
                {groupedReptiles.map((group) => (
                  <div key={group.label}>
                    <CommandItem
                      value={group.label}
                      onSelect={() =>
                        setExpandedSpecies(
                          expandedSpecies === group.label ? null : group.label
                        )
                      }
                      className="cursor-pointer font-medium group"
                    >
                      <ChevronsUpDown
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0 transition-transform group-hover:text-white",
                          expandedSpecies === group.label ? "rotate-180" : ""
                        )}
                      />
                      {group.label}
                    </CommandItem>
                    {expandedSpecies === group.label && (
                      <ScrollArea className="h-[250px]">
                        <div className="pl-6 border-l ml-2">
                          {group.items.map((item) => (
                            <CommandItem
                              key={item.value}
                              value={item.searchValue} // Use combined value for search
                              onSelect={() => {
                                onValueChange(item.value);
                                setOpen(false);
                              }}
                              className="py-2 group"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  value === item.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{item.label}</span>
                                <span className="text-xs text-muted-foreground group-hover:text-white">
                                  {item.code}
                                </span>
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
      );
    });
  }, [groupedReptiles]);

  return {
    groupedReptiles,
    ReptileSelect,
  };
}
