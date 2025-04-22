'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface MorphFilters {
  species?: string[];
  isGlobal?: boolean | null;
}

interface MorphFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: MorphFilters) => void;
  currentFilters: MorphFilters;
  speciesList: { value: string; label: string; }[];
}

export function MorphFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
  speciesList,
}: MorphFilterDialogProps) {
  const handleApply = () => {
    onApplyFilters(currentFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Morphs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Species</Label>
            <Select
              value={currentFilters.species?.[0] || ""}
              onValueChange={(value) => 
                onApplyFilters({ ...currentFilters, species: [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a species" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[...new Set(speciesList.map(species => species.value))].map((uniqueSpecies) => {
                    const species = speciesList.find(s => s.value === uniqueSpecies);
                    return (
                      <SelectItem 
                        key={uniqueSpecies}
                        value={uniqueSpecies}
                      >
                        {species?.label}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Morph Type</Label>
            <Select
              value={currentFilters.isGlobal?.toString() || "all"}
              onValueChange={(value) => 
                onApplyFilters({ 
                  ...currentFilters, 
                  isGlobal: value === "all" ? null : value === "true"
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select morph type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Morphs</SelectItem>
                  <SelectItem value="true">System Created</SelectItem>
                  <SelectItem value="false">User Created</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onApplyFilters({})}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}