import { SheddingPage } from '@/components/dashboard/shedding/SheddingPage';
import { SheddingReports } from '@/components/dashboard/shedding/SheddingReports';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';


export default function Page() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
          <h1 className="text-lg sm:text-xl 2xl:text-2xl text-foreground/85 dark:text-foreground/95  font-bold">Shed Management</h1>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
            Options
          </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Entries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <SheddingPage/>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <SheddingReports />
        </TabsContent>
      </Tabs>
      </div>
  )
} 