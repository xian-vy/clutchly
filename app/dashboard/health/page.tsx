'use client';


import { HealthEntriesTab } from '@/components/dashboard/health/entries/HealthEntriesTab';
import { HealthReportsTab } from '@/components/dashboard/health/reports/HealthReportsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default function HealthPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold mb-6">Health Management</h1>
        <Button variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>
      <Tabs defaultValue="entries" className="space-y-6">
        <div className="flex flex-col w-full">
          <TabsList>
            <TabsTrigger value="entries">Health Entries</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <hr className='mt-[1px]'/>
        </div>
    
        <TabsContent value="entries">
          <HealthEntriesTab />
        </TabsContent>

        <TabsContent value="reports">
          <HealthReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 