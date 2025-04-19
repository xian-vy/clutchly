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
import { CareLevel } from "@/lib/types/species";

export interface SpeciesFilters {
  careLevel?: CareLevel;
  isGlobal?: boolean | null;
}

interface SpeciesFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: SpeciesFilters) => void;
  currentFilters: SpeciesFilters;
}

export function SpeciesFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: SpeciesFilterDialogProps) {
  const handleApply = () => {
    onApplyFilters(currentFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Species</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Care Level</Label>
            <Select
              value={currentFilters.careLevel || "all"}
              onValueChange={(value) => 
                onApplyFilters({ 
                  ...currentFilters, 
                  careLevel: value === "all" ? undefined : value as CareLevel 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select care level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Species Type</Label>
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
                <SelectValue placeholder="Select species type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Species</SelectItem>
                  <SelectItem value="true">Global Species</SelectItem>
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