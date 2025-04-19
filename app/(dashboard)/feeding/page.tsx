import { FeedingSchedulesTab } from '@/components/dashboard/feeding/FeedingSchedulesTab'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FeedingPage() {
  return (
    <main className="container mx-auto py-6 max-w-7xl">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold">Feeding Schedules</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <FeedingSchedulesTab />
        </CardContent>
      </Card>
    </main>
  )
} 