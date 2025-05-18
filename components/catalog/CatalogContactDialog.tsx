'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CatalogSettings } from "@/lib/types/catalog";
import { MapPin } from "lucide-react";

interface CatalogContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogSettings: CatalogSettings | null;
}

export function CatalogContactDialog({ open, onOpenChange, catalogSettings }: CatalogContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {catalogSettings?.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-1" />
              <p className="text-sm ">{catalogSettings.address}</p>
            </div>
          )}
          {catalogSettings?.contacts && catalogSettings.contacts.length > 0 ? (
            <div className="space-y-2">
              {catalogSettings.contacts.map((contact, index) => (
                Object.entries(contact).map(([platform, link]) => (
                  <div key={`${index}-${platform}`} className="text-sm flex items-center gap-2">
                    <span className="font-medium capitalize">{platform}:</span>
                    <a 
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {link}
                    </a>
                  </div>
                ))
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No contact information available.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}