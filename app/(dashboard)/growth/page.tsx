
import { GrowthEntriesTab } from '@/components/dashboard/growth/entries/GrowthEntriesTab';
import { GrowthReportsTab } from '@/components/dashboard/growth/reports/GrowthReportsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default async function GrowthPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold mb-6">Growth Tracking</h1>
        <Button variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>
      <Tabs defaultValue="entries" className="w-full">
        <TabsList >
          <TabsTrigger value="entries">Entries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries">
          <GrowthEntriesTab />
        </TabsContent>
        
        <TabsContent value="reports">
          <GrowthReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
} 