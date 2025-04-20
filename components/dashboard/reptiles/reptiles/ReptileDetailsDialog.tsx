'use client';

import { EnrichedReptile } from "./ReptileList";
import { Reptile } from "@/lib/types/reptile";
import { ReptileDetails } from "./details/ReptileDetails";

interface ReptileDetailsDialogProps {
  reptile: EnrichedReptile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: Reptile[];
}

export function ReptileDetailsDialog({ 
  reptile, 
  open, 
  onOpenChange,
  reptiles 
}: ReptileDetailsDialogProps) {
  return (
    <ReptileDetails
      reptile={reptile}
      open={open}
      onOpenChange={onOpenChange}
      reptiles={reptiles}
    />
  );
}