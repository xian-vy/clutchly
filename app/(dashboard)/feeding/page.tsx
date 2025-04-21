import { FeedingLogsTab } from '@/components/dashboard/feeding/FeedingLogsTab'
import { FeedingSchedulesTab } from '@/components/dashboard/feeding/FeedingSchedulesTab'
import { FeedingTab } from '@/components/dashboard/feeding/FeedingTab'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from 'lucide-react'

export default function FeedingPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold mb-6">Feeding Schedule</h1>
        <Button variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>
      <Tabs defaultValue="feeding" className="space-y-6">
        <div className="flex flex-col w-full">
          <TabsList>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="logs">Logs & Reports</TabsTrigger>
          </TabsList>
          <hr className='mt-[1px]'/>
        </div>
    
        <TabsContent value="feeding">
          <FeedingTab />
        </TabsContent>

        <TabsContent value="schedules">
          <FeedingSchedulesTab />
        </TabsContent>

        <TabsContent value="logs">
          <FeedingLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 