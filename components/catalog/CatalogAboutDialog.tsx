'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CatalogSettings } from "@/lib/types/catalog";

interface CatalogAboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogSettings: CatalogSettings | null;
}

export function CatalogAboutDialog({ open, onOpenChange, catalogSettings }: CatalogAboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>About Us</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {catalogSettings?.about || 'No about information available.'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}