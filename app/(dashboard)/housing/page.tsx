
import { LocationsManagement, RacksManagement, RoomsManagement } from "@/components/dashboard/locations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Info, LayoutGrid, Package, Settings } from "lucide-react";


export default async function HousingPage() {
  return (
    <div className="container mx-auto">
     
         <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
            <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:!text-3xl font-bold">Housing Management</h1>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
              Options
            </Button>
        </div>
      
        
        <Tabs defaultValue="locations">
         <div className="flex flex-col w-full mb-4">
              <TabsList>
                 <TabsTrigger value="locations" className="flex items-center gap-1">
                  <Package className="h-4 w-4 mr-2" />
                  Enclosures
                </TabsTrigger>
                <TabsTrigger value="racks" className="flex items-center gap-1">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Racks
                </TabsTrigger>
                <TabsTrigger value="rooms" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4 mr-2" />
                  Rooms
                </TabsTrigger>
              </TabsList>
              <hr className='mt-[1px]'/>
          </div>

            
        <Alert className="mb-3">
          <Info className="h-4 w-4" />
          <AlertTitle>Organize Your Collection Efficiently (For large-scale keepers)</AlertTitle>
          <AlertDescription>
            Follow the steps below to set up your housing organization:
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Create <strong>Rooms</strong> first to define the physical spaces where your animals are kept</li>
              <li>Add <strong>Racks</strong> to each room with the appropriate number of rows (shelf levels)</li>
              <li><strong>Enclosures</strong> will be generated base on Rack dimensions.</li>
              <li>You can select an enclosure to house a reptile.</li>
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
              <LocationsManagement />
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
} 