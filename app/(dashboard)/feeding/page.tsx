import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { FeedingLogsTab } from '@/components/dashboard/feeding/FeedingLogsTab'
import { FeedingReportsTab } from '@/components/dashboard/feeding/FeedingReportsTab'
import { FeedingSchedulesTab } from '@/components/dashboard/feeding/FeedingSchedulesTab'
import { FeedingTab } from '@/components/dashboard/feeding/FeedingTab'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from 'lucide-react'

export default function FeedingPage() {
  return (
  <ProtectedRoute pageName='Feeding'>  
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
        <h1 className="text-lg sm:text-xl 2xl:text-2xl text-foreground/85 dark:text-foreground/95  font-bold">Feeding Management</h1>
        <Button size="sm" variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>
      <Tabs defaultValue="feeding" className="space-y-2 md:space-y-3 xl:space-y-6">
        <div className="flex flex-col w-full">
          <TabsList>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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

        <TabsContent value="reports">
          <FeedingReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  </ProtectedRoute>
  )
} 