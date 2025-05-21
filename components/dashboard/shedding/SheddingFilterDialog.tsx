import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface SheddingFilters {
  completeness?: string[];
  dateRange?: [string, string] | null;
  reptileIds?: string[];
}

interface SheddingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: SheddingFilters) => void;
  currentFilters: SheddingFilters;
  reptiles: { id: string; name: string; reptile_code?: string }[];
}

export function SheddingFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
  reptiles
}: SheddingFilterDialogProps) {
  const [filters, setFilters] = useState<SheddingFilters>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({});
    onApplyFilters({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Shedding Records</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Completeness</Label>
            <Select
              value={filters.completeness?.[0]}
              onValueChange={(value) => setFilters({ ...filters, completeness: value ? [value] : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select completeness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="retained">Retained</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Date Range</Label>
            <div className="flex space-x-2">
              <Input
                type="date"
                value={filters.dateRange?.[0] || ""}
                onChange={(e) => {
                  const endDate = filters.dateRange?.[1] || "";
                  setFilters({ ...filters, dateRange: [e.target.value, endDate] });
                }}
              />
              <Input
                type="date"
                value={filters.dateRange?.[1] || ""}
                onChange={(e) => {
                  const startDate = filters.dateRange?.[0] || "";
                  setFilters({ ...filters, dateRange: [startDate, e.target.value] });
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Reptile</Label>
            <Select
              value={filters.reptileIds?.[0]}
              onValueChange={(value) => setFilters({ ...filters, reptileIds: value ? [value] : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reptile" />
              </SelectTrigger>
              <SelectContent>
                {reptiles.map((reptile) => (
                  <SelectItem key={reptile.id} value={reptile.id}>
                    {reptile.name} {reptile.reptile_code ? `(${reptile.reptile_code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 