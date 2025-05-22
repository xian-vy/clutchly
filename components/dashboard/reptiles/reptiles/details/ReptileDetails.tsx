'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReptileDetails } from "./useReptileDetails";
import { EnrichedReptile } from "../ReptileList";
import { Reptile } from "@/lib/types/reptile";
import { AlertTriangle, Mars,  Printer, Venus, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewTab } from "./OverviewTab";
import { GrowthTab } from "./GrowthTab";
import { HealthTab } from "./HealthTab";
import { FeedingTab } from "./FeedingTab";
import { GeneticsTab } from "./GeneticsTab";
import { BreedingTab } from "./BreedingTab";
import { SheddingTab } from "./SheddingTab";
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
    <div className="space-y-6  p-2">
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
      <h3 className="text-base font-medium">Failed to load reptile details</h3>
      <p className="text-muted-foreground mt-2 text-sm">
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
      <DialogContent className="sm:max-w-[620px] md:max-w-[700px] lg:max-w-screen-lg h-[90vh] 3xl:h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-2 flex flex-row items-center justify-between border-b">
          <DialogTitle className="text-base md:text-lg flex items-center gap-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                  <>
                      {reptile.sex === 'male' ? (
                        <Mars className="h-4 w-4 text-blue-400 shrink-0"/>
                      ) : reptile.sex === 'female' ? (
                        <Venus className="h-4 w-4 text-red-500 shrink-0"/>
                      ) :(
                        <CircleHelp className="h-4 w-4 text-muted-foreground shrink-0"/>
                      )}
                  </>
                  <span className="text-base sm:text-lg 3xl:!text-xl font-bold">{reptile.name}</span> 
              </div>
                <span className="text-sm text-muted-foreground font-medium ml-1">
                    {reptile.reptile_code} 
                </span>
            </div>
       
          </DialogTitle>
      
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full h-full">
          <TabsList className="px-6 max-w-[320px] sm:max-w-full overflow-x-auto w-full flex justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="shedding">Shedding</TabsTrigger>
            <TabsTrigger value="genetics">Genetics</TabsTrigger>
            <TabsTrigger value="breeding">Breeding</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(60vh)] px-6">
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

                <TabsContent value="shedding">
                  <SheddingTab 
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

                <TabsContent value="breeding">
                  <BreedingTab 
                    reptiles={reptiles}
                    reptileDetails={reptileDetails || null} 
                  />
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
        <DialogFooter className="px-2 py-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!isLoading && !error && reptileDetails && (
            <Button 
              variant="outline" 
              onClick={handlePrintPDF}
              disabled={isPrinting}
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Generating..." : "Print"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 