
import { LocationsManagement, RacksManagement, RoomsManagement } from "@/components/dashboard/locations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Info, LayoutGrid, MapPin, Settings } from "lucide-react";


export default async function HousingPage() {
  return (
    <div className="container mx-auto">
     
         <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-bold mb-6">Housing Management</h1>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
              Options
            </Button>
        </div>
      
        
        <Tabs defaultValue="rooms">
          <TabsList className="mb-4">
            <TabsTrigger value="rooms" className="flex items-center gap-1">
              <Building2 className="h-4 w-4 mr-2" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="racks" className="flex items-center gap-1">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Racks
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-1">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
          </TabsList>
          
            
        <Alert className="mb-3">
          <Info className="h-4 w-4" />
          <AlertTitle>Organize Your Collection Efficiently</AlertTitle>
          <AlertDescription>
            Follow the steps below to set up your housing organization:
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Create <strong>Rooms</strong> first to define the physical spaces where your animals are kept</li>
              <li>Add <strong>Racks</strong> to each room with the appropriate number of rows (shelf levels)</li>
              <li>Generate <strong>Locations</strong> individually or in bulk with the visual grid generator for precise enclosure tracking</li>
            </ol>
          </AlertDescription>
        </Alert>
          <TabsContent value="rooms">
            <RoomsManagement />
          </TabsContent>
          
          <TabsContent value="racks">
            <RacksManagement />
          </TabsContent>
          
          <TabsContent value="locations">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-2">
                Locations represent individual enclosure positions within your racks. 
                Use the <strong>Bulk Generate</strong> feature with grid visualization to quickly create 
                multiple locations at once. The table view provides easy filtering and searching.
              </p>
              <LocationsManagement />
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
} 