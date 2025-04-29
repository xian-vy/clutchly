import { SalesReportTab } from '@/components/dashboard/sales/SalesReportTab';
import { SalesTab } from '@/components/dashboard/sales/SalesTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default async function SalesPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
        <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:!text-3xl font-bold">Sales Management</h1>
        <Button size="sm" variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>

      <Tabs defaultValue="records" className="space-y-2 md:space-y-3 xl:space-y-6">
        <div className="flex flex-col w-full">
          <TabsList>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <hr className='mt-[1px]'/>
        </div>
        <TabsContent value="records">
          <SalesTab />
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="text-center text-muted-foreground">
            <SalesReportTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 