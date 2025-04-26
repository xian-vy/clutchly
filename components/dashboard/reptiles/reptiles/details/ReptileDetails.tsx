'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReptileDetails } from "./useReptileDetails";
import { EnrichedReptile } from "../ReptileList";
import { Reptile } from "@/lib/types/reptile";
import { YES_NO_COLORS } from "@/lib/constants/colors";
import { AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewTab } from "./OverviewTab";
import { GrowthTab } from "./GrowthTab";
import { HealthTab } from "./HealthTab";
import { FeedingTab } from "./FeedingTab";
import { GeneticsTab } from "./GeneticsTab";
import { BreedingTab } from "./BreedingTab";
import { generateReptilePDF } from "@/components/dashboard/reptiles/reptiles/details/pdfGenerator";
import { useState } from 'react';

interface ReptileDetailsProps {
  reptile: EnrichedReptile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: Reptile[];
}

export function ReptileDetails({ reptile, open, onOpenChange, reptiles }: ReptileDetailsProps) {
  const {
    data: reptileDetails,
    isLoading,
    error,
    refetch
  } = useReptileDetails(reptile?.id || null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!reptile) return null;

  const renderLoadingContent = () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );

  const renderErrorContent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium">Failed to load reptile details</h3>
      <p className="text-muted-foreground mt-2">
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </p>
      <Button variant="outline" className="mt-4" onClick={() => refetch()}>
        Try Again
      </Button>
    </div>
  );

  const handlePrintPDF = async () => {
    if (!reptileDetails) return;
    
    try {
      setIsPrinting(true);
      const sireDetails = reptiles.find(r => r.id === reptile.sire_id);
      const damDetails = reptiles.find(r => r.id === reptile.dam_id);
      await generateReptilePDF(reptileDetails, sireDetails as EnrichedReptile, damDetails as EnrichedReptile);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-screen-md lg:max-w-screen-lg h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl flex items-center gap-2">
            {reptile.name}
            <div className="flex gap-2">
              {reptile.is_breeder && (
                <Badge variant="custom" className={YES_NO_COLORS.yes}>
                  Breeder
                </Badge>
              )}
              {reptile.retired_breeder && (
                <Badge variant="custom" className="bg-gray-500">
                  Retired
                </Badge>
              )}
            </div>
          </DialogTitle>
          {!isLoading && !error && reptileDetails && (
            <Button 
              variant="outline" 
              onClick={handlePrintPDF}
              disabled={isPrinting}
            >
              <Printer className="mr-2 h-4 w-4" />
              {isPrinting ? "Generating..." : "Print"}
            </Button>
          )}
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full h-full">
          <TabsList className="px-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="genetics">Genetics</TabsTrigger>
            {reptile.is_breeder && (
              <TabsTrigger value="breeding">Breeding</TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="h-[calc(90vh-140px)] px-6">
            {isLoading ? (
              renderLoadingContent()
            ) : error ? (
              renderErrorContent()
            ) : (
              <>
                <TabsContent value="overview">
                  <OverviewTab 
                    reptile={reptile} 
                    reptileDetails={reptileDetails || null} 
                  />
                </TabsContent>

                <TabsContent value="growth">
                  <GrowthTab 
                    reptileDetails={reptileDetails || null} 
                  />
                </TabsContent>

                <TabsContent value="health">
                  <HealthTab 
                    reptileDetails={reptileDetails || null} 
                  />
                </TabsContent>

                <TabsContent value="feeding">
                  <FeedingTab 
                    reptileDetails={reptileDetails || null} 
                  />
                </TabsContent>

                <TabsContent value="genetics">
                  <GeneticsTab 
                    reptile={reptile}
                    reptiles={reptiles}
                    reptileDetails={reptileDetails || null} 
                  />
                </TabsContent>

                {reptile.is_breeder && (
                  <TabsContent value="breeding">
                    <BreedingTab 
                      reptiles={reptiles}
                      reptileDetails={reptileDetails || null} 
                    />
                  </TabsContent>
                )}
              </>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 