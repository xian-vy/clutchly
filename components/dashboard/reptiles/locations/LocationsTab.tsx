'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomsManagement } from "./RoomsManagement";
import { RacksManagement } from "./RacksManagement";
import { LocationsManagement } from "./LocationsManagement";
import { Card } from "@/components/ui/card";

export function LocationsTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Reptile Housing Management</h2>
        <p className="text-muted-foreground mb-6">
          Manage your reptile housing locations by setting up rooms, racks, and precise enclosure positions.
          This helps you keep track of where each animal is housed in your collection.
        </p>
        
        <Tabs defaultValue="rooms">
          <TabsList className="mb-4">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="racks">Racks</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rooms">
            <RoomsManagement />
          </TabsContent>
          
          <TabsContent value="racks">
            <RacksManagement />
          </TabsContent>
          
          <TabsContent value="locations">
            <LocationsManagement />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 